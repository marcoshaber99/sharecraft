"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { StravaActivity } from "@/lib/strava/activities";
import { formatDistance, formatTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActivityCanvasProps {
  activity: StravaActivity;
}

type StatOption = {
  id: string;
  label: string;
  available: boolean;
  getValue: (activity: StravaActivity) => string | null;
};

const AVAILABLE_STATS: StatOption[] = [
  {
    id: "title",
    label: "Title",
    available: true,
    getValue: (a) => a.name,
  },
  {
    id: "main_stats",
    label: "Distance & Time",
    available: true,
    getValue: () => "true",
  },
  {
    id: "avg_power",
    label: "Avg Power",
    available: true,
    getValue: (a) =>
      a.average_watts ? `${Math.round(a.average_watts)}W` : null,
  },
  {
    id: "max_hr",
    label: "Max HR",
    available: true,
    getValue: (a) =>
      a.max_heartrate ? `${Math.round(a.max_heartrate)} bpm` : null,
  },
  {
    id: "avg_cadence",
    label: "Avg Cadence",
    available: true,
    getValue: (a) =>
      a.average_cadence ? `${Math.round(a.average_cadence)} rpm` : null,
  },
  {
    id: "date",
    label: "Date",
    available: true,
    getValue: (a) =>
      new Date(a.start_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
  },
  {
    id: "max_speed",
    label: "Max Speed",
    available: true,
    getValue: (a) => `${(a.max_speed * 3.6).toFixed(1)} km/h`,
  },
  {
    id: "avg_speed",
    label: "Avg Speed",
    available: true,
    getValue: (a) => `${(a.average_speed * 3.6).toFixed(1)} km/h`,
  },
  {
    id: "calories",
    label: "Calories",
    available: true,
    getValue: (a) => (a.calories ? `${a.calories} cal` : null),
  },
  {
    id: "total_elevation",
    label: "Total Elevation",
    available: true,
    getValue: (a) => `${Math.round(a.total_elevation_gain)}m`,
  },
];

const FONTS = [
  {
    id: "inter",
    name: "Inter",
    value: "'Inter', sans-serif",
    sizeAdjust: 1, // baseline
  },
  {
    id: "system",
    name: "System",
    value: "system-ui",
    sizeAdjust: 1,
  },
  {
    id: "roboto",
    name: "Roboto",
    value: "'Roboto', sans-serif",
    sizeAdjust: 1.1,
  },
  {
    id: "montserrat",
    name: "Montserrat",
    value: "'Montserrat', sans-serif",
    sizeAdjust: 1.05,
  },
  {
    id: "oswald",
    name: "Oswald",
    value: "'Oswald', sans-serif",
    sizeAdjust: 1.2,
  },
  {
    id: "playfair",
    name: "Playfair Display",
    value: "'Playfair Display', serif",
    sizeAdjust: 0.95,
  },
] as const;

type FontOption = (typeof FONTS)[number];
type FontValue = FontOption["value"];

export function ActivityCanvas({ activity }: ActivityCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fontScale, setFontScale] = useState(1);
  const [selectedStats, setSelectedStats] = useState<string[]>([
    "title",
    "main_stats",
    "date",
  ]);
  const [selectedFont, setSelectedFont] = useState<FontValue>(FONTS[0].value);
  const { toast } = useToast();

  // Memoize getFontSizeAdjust
  const getFontSizeAdjust = useCallback(() => {
    const currentFont = FONTS.find((font) => font.value === selectedFont);
    return (currentFont?.sizeAdjust || 1) * fontScale;
  }, [selectedFont, fontScale]);

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((blob) => resolve(blob!), "image/png")
      );

      // Try native sharing first
      if (
        navigator.share &&
        navigator.canShare({ files: [new File([blob], "activity.png")] })
      ) {
        try {
          await navigator.share({
            files: [new File([blob], "activity.png", { type: "image/png" })],
          });
          return;
        } catch (err) {
          if (!(err instanceof Error) || err.name !== "AbortError") {
            console.error("Share failed:", err);
          }
        }
      }

      // Try clipboard
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        toast({
          description: "Copied to clipboard",
          duration: 2000,
        });
        return;
      } catch (err) {
        console.error("Clipboard failed:", err);
      }

      // Fallback to download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${activity.name
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}.png`;
      link.click();
      URL.revokeObjectURL(url);
      toast({
        description: "Image downloaded",
        duration: 2000,
      });
    } catch (err) {
      console.error("Failed to export image:", err);
      toast({
        variant: "destructive",
        description: "Failed to export image",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const container = canvas.parentElement;
    if (!container) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = container.clientWidth;
    const displayHeight = displayWidth * (16 / 9);

    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    canvas.width = Math.floor(displayWidth * dpr);
    canvas.height = Math.floor(displayHeight * dpr);
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;

    // Make base size smaller by default
    const baseSize = (displayWidth / 20) * getFontSizeAdjust();
    const margin = baseSize * 2; // Add margin from edges

    // Draw activity name at the top if selected
    if (selectedStats.includes("title")) {
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      const titleY = displayHeight * 0.06;
      ctx.font = `bold ${baseSize * 1.2}px ${selectedFont}`;
      ctx.fillText(activity.name, margin, titleY);
    }

    // Draw main stats (distance and time) if selected
    if (selectedStats.includes("main_stats")) {
      const mainStatsY = displayHeight * 0.85;

      // Distance (left)
      ctx.font = `bold ${baseSize * 1.2}px ${selectedFont}`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.fillText(formatDistance(activity.distance), margin, mainStatsY);

      ctx.font = `500 ${baseSize * 0.5}px ${selectedFont}`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillText("Distance", margin, mainStatsY + baseSize * 0.7);

      // Time (right)
      ctx.textAlign = "right";
      ctx.font = `bold ${baseSize * 1.2}px ${selectedFont}`;
      ctx.fillStyle = "#ffffff";
      const timeX = displayWidth - margin;
      ctx.fillText(formatTime(activity.moving_time), timeX, mainStatsY);

      ctx.font = `500 ${baseSize * 0.5}px ${selectedFont}`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillText("Time", timeX, mainStatsY + baseSize * 0.7);
    }

    // Draw selected stats
    const selectedStatsData = selectedStats
      .filter((id) => id !== "title" && id !== "main_stats") // Exclude title and main_stats as they're handled separately
      .map((id) => AVAILABLE_STATS.find((s) => s.id === id))
      .filter((stat): stat is StatOption => !!stat)
      .map((stat) => ({
        label: stat.label,
        value: stat.getValue(activity),
      }))
      .filter((stat) => stat.value !== null);

    if (selectedStatsData.length > 0) {
      const startY = displayHeight * 0.2;
      const spacing = baseSize * 2; // Increased spacing between stats

      selectedStatsData.forEach((stat, index) => {
        const y = startY + spacing * index;

        ctx.textAlign = "left";
        ctx.font = `bold ${baseSize * 0.9}px ${selectedFont}`; // More consistent size
        ctx.fillStyle = "#ffffff";
        ctx.fillText(stat.value!, margin, y);

        ctx.font = `500 ${baseSize * 0.45}px ${selectedFont}`;
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fillText(stat.label, margin, y + baseSize * 0.6);
      });
    }
  }, [activity, selectedStats, selectedFont, getFontSizeAdjust]);

  return (
    <div className="space-y-4">
      <div className="w-full max-w-sm mx-auto">
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg"
          style={{
            aspectRatio: "9/16",
            backgroundColor: "#000",
          }}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Stats</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleShare}
            className="h-8"
          >
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-4 px-4">
          {AVAILABLE_STATS.map((stat) => {
            const isSelected = selectedStats.includes(stat.id);
            const value = stat.getValue(activity);
            const isAvailable = value !== null;

            return (
              <Button
                key={stat.id}
                variant={isSelected ? "default" : "secondary"}
                size="sm"
                className={`shrink-0 ${
                  !isAvailable ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => {
                  if (!isAvailable) return;
                  setSelectedStats((prev) =>
                    prev.includes(stat.id)
                      ? prev.filter((id) => id !== stat.id)
                      : [...prev, stat.id]
                  );
                }}
                disabled={!isAvailable}
              >
                {stat.label}
              </Button>
            );
          })}
        </div>

        <div className="grid gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">Font</span>
            </div>
            <Select
              value={selectedFont}
              onValueChange={(value: FontValue) => setSelectedFont(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a font" />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((font) => (
                  <SelectItem
                    key={font.id}
                    value={font.value}
                    style={{
                      fontFamily: font.value,
                      fontSize: font.id === "oswald" ? "1.1em" : "1em", // Adjust dropdown display
                    }}
                  >
                    {font.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Font Size</span>
              <span className="text-sm tabular-nums w-12 text-muted-foreground">
                {(fontScale * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              value={[fontScale]}
              onValueChange={(values: number[]) => setFontScale(values[0])}
              min={0.5}
              max={1.8}
              step={0.05}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

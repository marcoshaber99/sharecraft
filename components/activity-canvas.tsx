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

const GRADIENTS = [
  { id: "none", name: "Transparent", value: null },
  {
    id: "midnight",
    name: "Midnight Blue",
    value: {
      from: "rgba(30, 58, 138, 0.05)",
      to: "rgba(59, 130, 246, 0.15)",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    value: {
      from: "rgba(121, 40, 202, 0.05)",
      to: "rgba(255, 0, 128, 0.15)",
    },
  },
  {
    id: "forest",
    name: "Forest",
    value: {
      from: "rgba(6, 78, 59, 0.05)",
      to: "rgba(5, 150, 105, 0.15)",
    },
  },
  {
    id: "twilight",
    name: "Twilight",
    value: {
      from: "rgba(49, 46, 129, 0.05)",
      to: "rgba(129, 140, 248, 0.15)",
    },
  },
  {
    id: "ember",
    name: "Ember",
    value: {
      from: "rgba(24, 24, 27, 0.05)",
      to: "rgba(220, 38, 38, 0.15)",
    },
  },
] as const;

export function ActivityCanvas({ activity }: ActivityCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fontScale, setFontScale] = useState(1);
  const [selectedGradient, setSelectedGradient] =
    useState<(typeof GRADIENTS)[number]["id"]>("none");
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

    const ctx = canvas.getContext("2d", {
      alpha: true,
      willReadFrequently: false,
    });
    if (!ctx) return;

    const container = canvas.parentElement;
    if (!container) return;

    // Calculate dimensions with proper DPR handling
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = container.clientWidth;
    const displayHeight = displayWidth * (16 / 9);

    // Set canvas size with DPR consideration
    canvas.width = Math.floor(displayWidth * dpr);
    canvas.height = Math.floor(displayHeight * dpr);

    // Set display size
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // Scale all drawing operations by DPR
    ctx.scale(dpr, dpr);

    // Enable text rendering optimizations
    ctx.imageSmoothingEnabled = true;
    ctx.textBaseline = "middle"; // Consistent text positioning

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Draw gradient background if selected
    const gradient = GRADIENTS.find((g) => g.id === selectedGradient)?.value;
    if (gradient) {
      const gradientObj = ctx.createLinearGradient(
        0,
        displayHeight * 0.5,
        0,
        displayHeight
      );

      gradientObj.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradientObj.addColorStop(0.3, gradient.from);
      gradientObj.addColorStop(1, gradient.to);

      ctx.fillStyle = gradientObj;
      ctx.fillRect(0, 0, displayWidth, displayHeight);
    }

    // Make base size smaller by default but consider DPR for crispness
    const baseSize = Math.round((displayWidth / 24) * getFontSizeAdjust());
    const margin = baseSize * 2;

    // Helper function for text rendering with consistent quality
    const drawText = (text: string, x: number, y: number) => {
      // Draw text on pixel boundaries for sharpness
      ctx.fillText(text, Math.round(x), Math.round(y));
    };

    // Draw activity name at the top if selected
    if (selectedStats.includes("title")) {
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      const titleY = displayHeight * 0.15;
      ctx.font = `bold ${baseSize * 1.4}px ${selectedFont}`;
      drawText(activity.name, margin, titleY);
    }

    // Get all stats to display (including main stats)
    const allStatsData = selectedStats
      .map((id) => AVAILABLE_STATS.find((s) => s.id === id))
      .filter((stat): stat is StatOption => !!stat)
      .map((stat) => {
        if (stat.id === "main_stats") {
          // Split distance and time into separate stats
          return [
            {
              label: "Distance",
              value: formatDistance(activity.distance),
            },
            {
              label: "Moving Time",
              value: formatTime(activity.moving_time),
            },
          ];
        }
        const value = stat.getValue(activity);
        if (!value) return [];
        return [
          {
            label: stat.label,
            value,
          },
        ];
      })
      .flat()
      .filter(
        (stat): stat is { label: string; value: string } => stat.value !== null
      );

    // Draw stats in a grid at the bottom
    if (allStatsData.length > 0) {
      const gridStartY = displayHeight * 0.7;
      const columnCount = 2;
      const rowGap = baseSize * 5.5;
      const columnWidth = (displayWidth - margin * 2) / columnCount;

      allStatsData.forEach((stat, index) => {
        const row = Math.floor(index / columnCount);
        const col = index % columnCount;
        const x = margin + col * columnWidth;
        const y = gridStartY + row * rowGap;
        const centerX = x + columnWidth / 2;

        // Draw label (smaller, above)
        ctx.font = `500 ${baseSize * 0.85}px ${selectedFont}`;
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.textAlign = "center";
        drawText(stat.label, centerX, y);

        // Draw value (larger, below)
        ctx.font = `bold ${baseSize * 1.6}px ${selectedFont}`;
        ctx.fillStyle = "#ffffff";
        drawText(stat.value, centerX, y + baseSize * 1.8);
      });
    }
  }, [
    activity,
    selectedStats,
    selectedFont,
    getFontSizeAdjust,
    selectedGradient,
  ]);

  return (
    <div className="space-y-4">
      <div className="w-full max-w-sm mx-auto">
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg"
          style={{
            aspectRatio: "9/16",
            background:
              selectedGradient === "none"
                ? "#000"
                : `#000 linear-gradient(135deg, ${
                    GRADIENTS.find((g) => g.id === selectedGradient)?.value
                      ?.from || "transparent"
                  }, ${
                    GRADIENTS.find((g) => g.id === selectedGradient)?.value
                      ?.to || "transparent"
                  })`,
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
              <span className="text-sm font-medium">Background</span>
            </div>
            <Select
              value={selectedGradient}
              onValueChange={(value: (typeof GRADIENTS)[number]["id"]) =>
                setSelectedGradient(value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select background" />
              </SelectTrigger>
              <SelectContent>
                {GRADIENTS.map((gradient) => (
                  <SelectItem
                    key={gradient.id}
                    value={gradient.id}
                    className="flex items-center gap-2"
                  >
                    {gradient.value ? (
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          background: gradient.value
                            ? `linear-gradient(135deg, ${gradient.value.from}, ${gradient.value.to})`
                            : undefined,
                        }}
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-border" />
                    )}
                    {gradient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

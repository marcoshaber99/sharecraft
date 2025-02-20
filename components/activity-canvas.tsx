"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { StravaActivity } from "@/lib/strava/activities";
import { formatDistance, formatTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Share, ChevronDown, ChevronUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
    id: "avg_hr",
    label: "Avg Heart Rate",
    available: true,
    getValue: (a) =>
      a.average_heartrate ? `${Math.round(a.average_heartrate)} bpm` : null,
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
    id: "pace",
    label: "Pace",
    available: true,
    getValue: (a) => {
      if (a.type === "Swim") {
        // Convert m/s to min/100m for swimming
        const paceInMinPer100m = 100 / a.average_speed / 60;
        const minutes = Math.floor(paceInMinPer100m);
        const seconds = Math.round((paceInMinPer100m - minutes) * 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}/100m`;
      }
      // Regular pace for other activities (min/km)
      const paceInMinPerKm = 16.6667 / a.average_speed;
      const minutes = Math.floor(paceInMinPerKm);
      const seconds = Math.round((paceInMinPerKm - minutes) * 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}/km`;
    },
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
    id: "geist",
    name: "Geist",
    value: "'Geist', sans-serif",
    sizeAdjust: 1,
  },
  {
    id: "geist-mono",
    name: "Geist Mono",
    value: "'Geist Mono', monospace",
    sizeAdjust: 0.95,
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

const FONT_SIZES = [
  { id: "xs", label: "XS", value: 0.6 },
  { id: "s", label: "S", value: 0.8 },
  { id: "m", label: "M", value: 1.0 },
  { id: "l", label: "L", value: 1.2 },
  { id: "xl", label: "XL", value: 1.4 },
] as const;

export function ActivityCanvas({ activity }: ActivityCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fontScale, setFontScale] = useState(0.8);
  const [selectedGradient, setSelectedGradient] =
    useState<(typeof GRADIENTS)[number]["id"]>("none");
  const [selectedStats, setSelectedStats] = useState<string[]>([
    "title",
    "main_stats",
    "date",
  ]);
  const [selectedFont, setSelectedFont] = useState<FontValue>(FONTS[0].value);
  const { toast } = useToast();
  const [isStatsOpen, setIsStatsOpen] = useState(true);
  const [showAdvancedSize, setShowAdvancedSize] = useState(false);

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

    // Helper function to wrap text
    const wrapText = (text: string, maxWidth: number) => {
      const words = text.split(" ");
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const width = ctx.measureText(currentLine + " " + words[i]).width;
        if (width < maxWidth) {
          currentLine += " " + words[i];
        } else {
          lines.push(currentLine);
          currentLine = words[i];
        }
      }
      lines.push(currentLine);
      return lines;
    };

    // Draw activity name at the top if selected
    if (selectedStats.includes("title")) {
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${baseSize * 1.2}px ${selectedFont}`;

      const maxWidth = displayWidth - margin * 2;
      const lines = wrapText(activity.name, maxWidth);
      const lineHeight = baseSize * 1.5;
      const titleStartY = displayHeight * 0.08;

      lines.forEach((line, index) => {
        drawText(line, margin, titleStartY + index * lineHeight);
      });
    }

    // Draw date in top right if selected
    if (selectedStats.includes("date")) {
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      const dateY = displayHeight * 0.08; // Keep date aligned with first line of title
      ctx.font = `500 ${baseSize * 0.9}px ${selectedFont}`;
      const formattedDate = new Date(activity.start_date).toLocaleDateString(
        undefined,
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );
      drawText(formattedDate, displayWidth - margin, dateY);
    }

    // Get all stats to display (excluding title and date)
    const allStatsData = selectedStats
      .filter((id) => id !== "title" && id !== "date") // Exclude title and date from grid
      .map((id) => AVAILABLE_STATS.find((s) => s.id === id))
      .filter((stat): stat is StatOption => !!stat)
      .map((stat) => {
        if (stat.id === "main_stats") {
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
      const gridStartY = displayHeight * 0.55;
      const columnCount = 2;
      const rowGap = baseSize * 4; // Increased from 3.5 to 4
      const labelValueGap = baseSize * 1.2;

      // Calculate grid dimensions
      const totalWidth = displayWidth - margin * 2;
      const columnWidth = totalWidth / columnCount;
      const gridLeft = (displayWidth - totalWidth) / 2;

      // Calculate total grid height to ensure it fits
      const rowCount = Math.ceil(allStatsData.length / columnCount);
      const totalGridHeight = rowCount * rowGap - (rowGap - labelValueGap);
      const bottomMargin = displayHeight * 0.1; // Keep some space at bottom

      // Adjust starting Y if grid would overflow
      const adjustedGridStartY = Math.min(
        gridStartY,
        displayHeight - totalGridHeight - bottomMargin
      );

      allStatsData.forEach((stat, index) => {
        const row = Math.floor(index / columnCount);
        const col = index % columnCount;
        const columnCenter = gridLeft + columnWidth * col + columnWidth / 2;
        const y = adjustedGridStartY + row * rowGap;

        // Draw label (smaller, above)
        ctx.font = `500 ${baseSize * 0.7}px ${selectedFont}`;
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.textAlign = "center";
        drawText(stat.label, columnCenter, y);

        // Draw value (larger, below)
        ctx.font = `bold ${baseSize * 1.3}px ${selectedFont}`;
        ctx.fillStyle = "#ffffff";
        drawText(stat.value, columnCenter, y + labelValueGap);
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
    <div className="space-y-8">
      {/* Canvas Preview */}
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
        <div className="flex justify-center">
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="text-xs font-medium"
          >
            <Share className="h-3.5 w-3.5 mr-1.5" />
            Share
          </Button>
        </div>
      </div>

      {/* Customization Controls */}
      <div className="space-y-8">
        {/* Stats Selection */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent"
            onClick={() => setIsStatsOpen(!isStatsOpen)}
          >
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Stats {selectedStats.length > 0 && `(${selectedStats.length})`}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isStatsOpen && "transform rotate-180"
              )}
            />
          </Button>
          <div
            className={cn(
              "grid transition-all duration-200 ease-out",
              isStatsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr] opacity-50"
            )}
          >
            <div className="overflow-hidden min-h-0">
              <div className="flex flex-wrap gap-2 py-1">
                {AVAILABLE_STATS.map((stat) => {
                  const isSelected = selectedStats.includes(stat.id);
                  const value = stat.getValue(activity);
                  const isAvailable = value !== null;

                  return (
                    <Button
                      key={stat.id}
                      variant={isSelected ? "default" : "secondary"}
                      size="sm"
                      className={`${
                        !isAvailable ? "opacity-50 cursor-not-allowed" : ""
                      } text-sm py-1 h-auto min-h-[32px]`}
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
            </div>
          </div>
        </div>

        {/* Style Controls */}
        <div className="grid gap-8 sm:grid-cols-2">
          {/* Background */}
          <div className="space-y-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Background
            </span>
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

          {/* Font Selection */}
          <div className="space-y-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Font
            </span>
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
                      fontSize: "1em",
                    }}
                  >
                    {font.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Font Size Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Font Size
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowAdvancedSize(!showAdvancedSize)}
            >
              {showAdvancedSize ? (
                <ChevronUp className="h-3 w-3 mr-1" />
              ) : (
                <ChevronDown className="h-3 w-3 mr-1" />
              )}
              {showAdvancedSize ? "Simple" : "Advanced"}
            </Button>
          </div>

          {/* Preset Buttons */}
          <div className="flex gap-2">
            {FONT_SIZES.map((size) => (
              <Button
                key={size.id}
                variant={
                  Math.abs(fontScale - size.value) < 0.01
                    ? "default"
                    : "outline"
                }
                size="sm"
                className="flex-1 text-xs h-7"
                onClick={() => setFontScale(size.value)}
              >
                {size.label}
              </Button>
            ))}
          </div>

          {/* Advanced Slider */}
          {showAdvancedSize && (
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm tabular-nums text-muted-foreground">
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
          )}
        </div>
      </div>
    </div>
  );
}

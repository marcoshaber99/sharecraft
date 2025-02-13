"use client";

import { useEffect, useRef, useState } from "react";
import type { StravaActivity } from "@/lib/strava/activities";
import { formatDistance, formatTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Download, Plus, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

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

export function ActivityCanvas({ activity }: ActivityCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fontScale, setFontScale] = useState(1);
  const [selectedStats, setSelectedStats] = useState<string[]>(["date"]);
  const { toast } = useToast();

  // Function to handle downloading the canvas
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `${activity.name
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}.png`;

    canvas.toBlob((blob) => {
      if (!blob) return;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);

      toast({
        description: "Image downloaded successfully",
        duration: 2000,
      });
    }, "image/png");
  };

  // Function to copy canvas to clipboard
  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((blob) => resolve(blob!), "image/png")
      );
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);

      toast({
        description: "Copied to clipboard",
        duration: 2000,
      });
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      toast({
        variant: "destructive",
        description: "Failed to copy to clipboard",
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

    const baseSize = (displayWidth / 10) * fontScale;

    // Draw activity name at the top
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    const titleY = displayHeight * 0.06;
    ctx.font = `bold ${baseSize * 0.8}px var(--font-geist-sans)`;
    ctx.fillText(activity.name, baseSize, titleY);

    // Draw main stats (distance and time)
    const mainStatsY = displayHeight * 0.85;

    // Distance (left)
    ctx.font = `bold ${baseSize * 1.2}px var(--font-geist-sans)`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText(formatDistance(activity.distance), baseSize, mainStatsY);

    ctx.font = `500 ${baseSize * 0.5}px var(--font-geist-sans)`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText("Distance", baseSize, mainStatsY + baseSize * 0.8);

    // Time (right)
    ctx.textAlign = "right";
    ctx.font = `bold ${baseSize * 1.2}px var(--font-geist-sans)`;
    ctx.fillStyle = "#ffffff";
    const timeX = displayWidth - baseSize;
    ctx.fillText(formatTime(activity.moving_time), timeX, mainStatsY);

    ctx.font = `500 ${baseSize * 0.5}px var(--font-geist-sans)`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText("Time", timeX, mainStatsY + baseSize * 0.8);

    // Draw selected stats
    const selectedStatsData = selectedStats
      .map((id) => AVAILABLE_STATS.find((s) => s.id === id))
      .filter((stat): stat is StatOption => !!stat)
      .map((stat) => ({
        label: stat.label,
        value: stat.getValue(activity),
      }))
      .filter((stat) => stat.value !== null);

    if (selectedStatsData.length > 0) {
      const startY = displayHeight * 0.2;
      const spacing = baseSize * 1.5;

      selectedStatsData.forEach((stat, index) => {
        const y = startY + spacing * index;

        ctx.textAlign = "left";
        ctx.font = `bold ${baseSize * 0.7}px var(--font-geist-sans)`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(stat.value!, baseSize, y);

        ctx.font = `500 ${baseSize * 0.4}px var(--font-geist-sans)`;
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fillText(stat.label, baseSize, y + baseSize * 0.5);
      });
    }
  }, [activity, fontScale, selectedStats]);

  return (
    <div className="space-y-6">
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

      <div className="w-full max-w-sm mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Add more stats</span>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCopy}
              className="h-8 w-8 hover:bg-secondary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDownload}
              className="h-8 w-8 hover:bg-secondary"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {AVAILABLE_STATS.map((stat) => {
            const isSelected = selectedStats.includes(stat.id);
            const value = stat.getValue(activity);
            const isAvailable = value !== null;

            return (
              <Button
                key={stat.id}
                variant={isSelected ? "default" : "outline"}
                className={`h-auto py-2 px-3 justify-start font-normal ${
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
                {isSelected ? (
                  <X className="h-3 w-3 mr-2" />
                ) : (
                  <Plus className="h-3 w-3 mr-2" />
                )}
                {stat.label}
              </Button>
            );
          })}
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
            max={2}
            step={0.1}
          />
        </div>
      </div>
    </div>
  );
}

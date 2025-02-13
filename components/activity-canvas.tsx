"use client";

import { useEffect, useRef } from "react";
import type { StravaActivity } from "@/lib/strava/activities";
import { formatDistance, formatTime } from "@/lib/utils/format";

interface ActivityCanvasProps {
  activity: StravaActivity;
}

export function ActivityCanvas({ activity }: ActivityCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Get the container dimensions
    const container = canvas.parentElement;
    if (!container) return;

    // Get the device pixel ratio
    const dpr = window.devicePixelRatio || 1;

    // Set the display size
    const displayWidth = container.clientWidth;
    const displayHeight = displayWidth * (16 / 9);

    // Set the canvas display size
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // Set the actual canvas buffer size
    canvas.width = Math.floor(displayWidth * dpr);
    canvas.height = Math.floor(displayHeight * dpr);

    // Scale the context to handle the device pixel ratio
    ctx.scale(dpr, dpr);

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Enable text antialiasing
    ctx.imageSmoothingEnabled = true;

    // Calculate base sizes (relative to display width)
    const baseSize = displayWidth / 10; // 10% of width as base unit

    // Set text styles
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";

    // Draw activity name at the top (6% of height from top)
    const titleY = displayHeight * 0.06;
    ctx.font = `bold ${baseSize * 0.8}px var(--font-geist-sans)`;
    ctx.fillText(activity.name, baseSize, titleY);

    // Draw stats at the bottom (85% down the canvas)
    const statsY = displayHeight * 0.85;

    // Distance
    ctx.font = `bold ${baseSize * 1.2}px var(--font-geist-sans)`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(formatDistance(activity.distance), baseSize, statsY);

    ctx.font = `500 ${baseSize * 0.5}px var(--font-geist-sans)`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText("Distance", baseSize, statsY + baseSize * 0.8);

    // Time (right-aligned)
    ctx.textAlign = "right";
    ctx.font = `bold ${baseSize * 1.2}px var(--font-geist-sans)`;
    ctx.fillStyle = "#ffffff";
    const timeX = displayWidth - baseSize;
    ctx.fillText(formatTime(activity.moving_time), timeX, statsY);

    ctx.font = `500 ${baseSize * 0.5}px var(--font-geist-sans)`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText("Time", timeX, statsY + baseSize * 0.8);

    // Add date at the bottom (92% down the canvas)
    ctx.textAlign = "left";
    ctx.font = `500 ${baseSize * 0.4}px var(--font-geist-sans)`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    const date = new Date(activity.start_date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    ctx.fillText(date, baseSize, displayHeight * 0.92);
  }, [activity]);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{
          aspectRatio: "9/16",
          backgroundColor: "#000", // Temporary background for development
        }}
      />
    </div>
  );
}

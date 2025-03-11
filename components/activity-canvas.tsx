"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { StravaActivity } from "@/lib/strava/activities";
import { Button } from "@/components/ui/button";
import { Share, ChevronDown, ChevronUp, Sun, Moon, Move } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { shareImage } from "@/lib/utils/share";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FONTS, GRADIENTS, FONT_SIZES, AVAILABLE_STATS } from "@/lib/constants";
import type { StatOption } from "@/lib/constants";

interface ActivityCanvasProps {
  activity: StravaActivity;
}

type FontOption = (typeof FONTS)[number];
type FontValue = FontOption["value"];

// Added new interfaces for handling draggable text
interface StatPosition {
  id: string;
  x: number;
  y: number;
}

interface DragState {
  id: string;
  offsetX: number;
  offsetY: number;
}

// Add new interface for alignment guides
interface AlignmentGuide {
  orientation: "horizontal" | "vertical";
  position: number;
}

export function ActivityCanvas({ activity }: ActivityCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontScale, setFontScale] = useState(0.8);
  const [selectedGradient, setSelectedGradient] =
    useState<(typeof GRADIENTS)[number]["id"]>("none");
  const [selectedStats, setSelectedStats] = useState<string[]>([
    "title",
    "distance",
    "time",
    "date",
  ]);
  const [selectedFont, setSelectedFont] = useState<FontValue>(FONTS[0].value);
  const [isWhiteText, setIsWhiteText] = useState(true);
  const [isStatsOpen, setIsStatsOpen] = useState(true);
  const [showAdvancedSize, setShowAdvancedSize] = useState(false);
  // New state for draggable positions
  const [statPositions, setStatPositions] = useState<StatPosition[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  // Add state for alignment guides
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const [snapDistance] = useState(10); // Distance in pixels for snapping
  // Add state to detect mobile device
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile on component mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Memoize getFontSizeAdjust
  const getFontSizeAdjust = useCallback(() => {
    const currentFont = FONTS.find((font) => font.value === selectedFont);
    // Adjust font size based on device
    const mobileFactor = isMobile ? 0.85 : 1;
    return (currentFont?.sizeAdjust || 1) * fontScale * mobileFactor;
  }, [selectedFont, fontScale, isMobile]);

  const handleShare = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const fileName = `${activity.name
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}.png`;
    shareImage({ canvas, fileName });
  };

  // Initialize or update default positions when selected stats change
  useEffect(() => {
    // Create initial positions if they don't exist yet
    if (statPositions.length === 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      const newPositions: StatPosition[] = [];

      // Default positions
      if (selectedStats.includes("title")) {
        newPositions.push({
          id: "title",
          x: displayWidth * 0.5,
          y: displayHeight * 0.08,
        });
      }

      if (selectedStats.includes("date")) {
        newPositions.push({
          id: "date",
          x: displayWidth * 0.85,
          y: displayHeight * 0.08,
        });
      }

      // Position distance and time stats (previously part of main_stats)
      if (selectedStats.includes("distance")) {
        newPositions.push({
          id: "distance",
          x: displayWidth * 0.3,
          y: displayHeight * 0.55,
        });
      }

      if (selectedStats.includes("time")) {
        newPositions.push({
          id: "time",
          x: displayWidth * 0.7,
          y: displayHeight * 0.55,
        });
      }

      // Handle other stats with default grid positions
      const otherStats = selectedStats.filter(
        (id) =>
          id !== "title" && id !== "date" && id !== "distance" && id !== "time"
      );

      otherStats.forEach((stat, index) => {
        const columnCount = 2;
        const col = index % columnCount;
        const row = Math.floor(index / columnCount);

        newPositions.push({
          id: stat,
          x: displayWidth * (0.25 + col * 0.5),
          y: displayHeight * (0.7 + row * 0.15),
        });
      });

      setStatPositions(newPositions);
    } else {
      // Update positions for newly added stats
      const newStats = selectedStats.filter(
        (id) => !statPositions.some((pos) => pos.id === id)
      );

      if (newStats.length > 0 && canvasRef.current) {
        const canvas = canvasRef.current;
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        const newPositions = [...statPositions];

        newStats.forEach((stat) => {
          // Place new stats in reasonable default positions
          if (stat === "title") {
            newPositions.push({
              id: stat,
              x: displayWidth * 0.5,
              y: displayHeight * 0.08,
            });
          } else if (stat === "date") {
            newPositions.push({
              id: stat,
              x: displayWidth * 0.85,
              y: displayHeight * 0.08,
            });
          } else if (stat === "distance") {
            newPositions.push({
              id: stat,
              x: displayWidth * 0.3,
              y: displayHeight * 0.55,
            });
          } else if (stat === "time") {
            newPositions.push({
              id: stat,
              x: displayWidth * 0.7,
              y: displayHeight * 0.55,
            });
          } else {
            // Find an empty spot for other stats
            newPositions.push({
              id: stat,
              x: displayWidth * 0.5,
              y: displayHeight * 0.7,
            });
          }
        });

        setStatPositions(newPositions);
      }

      // Remove positions for stats that are no longer selected
      const updatedPositions = statPositions.filter((pos) =>
        selectedStats.includes(pos.id)
      );

      if (updatedPositions.length !== statPositions.length) {
        setStatPositions(updatedPositions);
      }
    }
  }, [selectedStats, statPositions.length]);

  // Helper function to get position from either mouse or touch event
  const getEventPosition = useCallback(
    (e: MouseEvent | TouchEvent, rect: DOMRect) => {
      if ("touches" in e) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
      } else {
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }
    },
    []
  );

  // Update the mouse/touch move handler to calculate alignments
  const handleGlobalPointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!dragState || !canvasRef.current) return;

      // Prevent default first thing to stop scrolling
      e.preventDefault();

      // For TouchEvent, we need to also stop propagation
      if ("touches" in e) {
        e.stopPropagation();
      }

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      const { x: pointerX, y: pointerY } = getEventPosition(e, rect);

      // Calculate new position
      let x = pointerX - dragState.offsetX;
      let y = pointerY - dragState.offsetY;

      // Add bounds checking to prevent dragging outside the canvas
      x = Math.max(0, Math.min(canvas.clientWidth, x));
      y = Math.max(0, Math.min(canvas.clientHeight, y));

      // Find potential alignments with other elements
      const newAlignmentGuides: AlignmentGuide[] = [];
      const currentPosition = statPositions.find(
        (pos) => pos.id === dragState.id
      );
      if (!currentPosition) return;

      // Check for alignment with other elements
      statPositions.forEach((pos) => {
        if (pos.id === dragState.id) return; // Skip the element being dragged

        // Check for vertical alignment (x-axis)
        if (Math.abs(pos.x - x) < snapDistance) {
          newAlignmentGuides.push({
            orientation: "vertical",
            position: pos.x,
          });
          // Snap to this position
          x = pos.x;
        }

        // Check for horizontal alignment (y-axis)
        if (Math.abs(pos.y - y) < snapDistance) {
          newAlignmentGuides.push({
            orientation: "horizontal",
            position: pos.y,
          });
          // Snap to this position
          y = pos.y;
        }
      });

      // Check for center alignment
      if (canvas) {
        const canvasWidth = canvas.clientWidth;
        const canvasHeight = canvas.clientHeight;

        // Center vertical line
        const centerX = canvasWidth / 2;
        if (Math.abs(x - centerX) < snapDistance) {
          newAlignmentGuides.push({
            orientation: "vertical",
            position: centerX,
          });
          x = centerX;
        }

        // Check for thirds (rule of thirds)
        [canvasWidth / 3, (canvasWidth * 2) / 3].forEach((thirdX) => {
          if (Math.abs(x - thirdX) < snapDistance) {
            newAlignmentGuides.push({
              orientation: "vertical",
              position: thirdX,
            });
            x = thirdX;
          }
        });

        [canvasHeight / 3, (canvasHeight * 2) / 3].forEach((thirdY) => {
          if (Math.abs(y - thirdY) < snapDistance) {
            newAlignmentGuides.push({
              orientation: "horizontal",
              position: thirdY,
            });
            y = thirdY;
          }
        });
      }

      // Update alignment guides
      setAlignmentGuides(newAlignmentGuides);

      // Update the position for the dragged element
      setStatPositions((prev) =>
        prev.map((pos) => (pos.id === dragState.id ? { ...pos, x, y } : pos))
      );
    },
    [dragState, statPositions, snapDistance, getEventPosition]
  );

  // Update the pointer up handler to clear alignment guides
  const handleGlobalPointerUp = useCallback(() => {
    setDragState(null);
    setIsDragging(false);
    setAlignmentGuides([]); // Clear alignment guides
  }, []);

  // Update the effect for pointer events
  useEffect(() => {
    if (!dragState) return;

    // Handler for preventing any default scrolling behavior during drag
    const preventDefaultScroll = (e: Event) => {
      e.preventDefault();
    };

    // Add touch event listeners with capturing phase to prevent scrolling
    document.addEventListener("touchmove", preventDefaultScroll, {
      passive: false,
    });

    // Add both mouse and touch event listeners
    window.addEventListener("mousemove", handleGlobalPointerMove);
    window.addEventListener("mouseup", handleGlobalPointerUp);
    window.addEventListener("touchmove", handleGlobalPointerMove, {
      passive: false,
    });
    window.addEventListener("touchend", handleGlobalPointerUp);

    return () => {
      document.removeEventListener("touchmove", preventDefaultScroll);
      window.removeEventListener("mousemove", handleGlobalPointerMove);
      window.removeEventListener("mouseup", handleGlobalPointerUp);
      window.removeEventListener("touchmove", handleGlobalPointerMove);
      window.removeEventListener("touchend", handleGlobalPointerUp);
    };
  }, [dragState, handleGlobalPointerMove, handleGlobalPointerUp]);

  // Recalculate canvas on resize or orientation change
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        // Redraw canvas on resize
        const displayWidth = containerRef.current.clientWidth;
        const displayHeight = displayWidth * (16 / 9);

        // Update canvas dimensions if needed
        canvasRef.current.style.width = `${displayWidth}px`;
        canvasRef.current.style.height = `${displayHeight}px`;

        // Trigger a redraw by updating a state
        setFontScale((prevScale) => prevScale);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

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

    const textColor = isWhiteText ? "#ffffff" : "#000000";
    const secondaryColor = isWhiteText ? "#ffffffcc" : "#000000cc";

    // Draw activity name at the top if selected
    if (selectedStats.includes("title")) {
      const titlePosition = statPositions.find((pos) => pos.id === "title");
      const titleX = titlePosition?.x ?? margin;
      const titleY = titlePosition?.y ?? displayHeight * 0.08;

      ctx.textAlign = "center"; // Changed to center for draggable positioning
      ctx.textBaseline = "middle";
      ctx.fillStyle = textColor;
      ctx.font = `bold ${baseSize * 1.2}px ${selectedFont}`;

      const maxWidth = displayWidth - margin * 2;
      const lines = wrapText(activity.name, maxWidth);
      const lineHeight = baseSize * 1.5;

      lines.forEach((line, index) => {
        drawText(line, titleX, titleY + index * lineHeight);
      });
    }

    // Draw date in top right if selected
    if (selectedStats.includes("date")) {
      const datePosition = statPositions.find((pos) => pos.id === "date");
      const dateX = datePosition?.x ?? displayWidth - margin;
      const dateY = datePosition?.y ?? displayHeight * 0.08;

      ctx.textAlign = "center"; // Changed to center for draggable positioning
      ctx.textBaseline = "middle";
      ctx.fillStyle = secondaryColor;
      ctx.font = `500 ${baseSize * 0.9}px ${selectedFont}`;

      const formattedDate = new Date(activity.start_date).toLocaleDateString(
        undefined,
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );
      drawText(formattedDate, dateX, dateY);
    }

    // Get all stats to display (excluding title and date)
    const statsToDisplay = selectedStats
      .filter((id) => id !== "title" && id !== "date") // Exclude title and date from grid
      .map((id) => AVAILABLE_STATS.find((s) => s.id === id))
      .filter((stat): stat is StatOption => !!stat);

    // Draw each stat using its custom position
    statsToDisplay.forEach((stat) => {
      const statPosition = statPositions.find((pos) => pos.id === stat.id);
      if (!statPosition) return; // Skip if position not found

      // Draw the stat based on its ID
      ctx.textAlign = "center";

      // Label
      ctx.fillStyle = secondaryColor;
      ctx.font = `500 ${baseSize * 0.7}px ${selectedFont}`;
      drawText(stat.label, statPosition.x, statPosition.y);

      // Value
      const value = stat.getValue(activity);
      if (!value) return;

      ctx.fillStyle = textColor;
      ctx.font = `bold ${baseSize * 1.3}px ${selectedFont}`;
      drawText(value, statPosition.x, statPosition.y + baseSize * 1.2);
    });

    // Draw drag indicators if in dragging mode
    if (isDragging) {
      statPositions.forEach((pos) => {
        const isBeingDragged = dragState?.id === pos.id;

        // Draw a subtle indicator around the text for dragging
        ctx.strokeStyle = isBeingDragged
          ? "#3b82f6"
          : "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = isBeingDragged ? 2 : 1;

        // Draw a circle indicating the drag point
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, baseSize * 0.4, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Draw alignment guides
      if (alignmentGuides.length > 0) {
        ctx.strokeStyle = "#3b82f6"; // Blue color for alignment guides
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 3]); // Dashed line

        alignmentGuides.forEach((guide) => {
          if (guide.orientation === "vertical") {
            ctx.beginPath();
            ctx.moveTo(guide.position, 0);
            ctx.lineTo(guide.position, displayHeight);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(0, guide.position);
            ctx.lineTo(displayWidth, guide.position);
            ctx.stroke();
          }
        });

        ctx.setLineDash([]); // Reset dash pattern
      }
    }
  }, [
    activity,
    selectedStats,
    selectedFont,
    getFontSizeAdjust,
    selectedGradient,
    isWhiteText,
    statPositions,
    isDragging,
    dragState,
    alignmentGuides,
  ]);

  // Helper function to check if a click was on a specific draggable element
  const getClickedElementId = (x: number, y: number) => {
    for (const pos of statPositions) {
      // Simple distance check for draggable points
      const dx = pos.x - x;
      const dy = pos.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If clicked within a reasonable radius of the element center
      // Make this radius larger on mobile for easier touch
      const clickRadius = isMobile ? 40 : 30;
      if (distance < clickRadius) {
        return pos.id;
      }
    }
    return null;
  };

  // Update canvas pointer down handler to start dragging
  const handleCanvasPointerDown = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Handle touch events
    let clientX, clientY;
    if ("touches" in e) {
      // Prevent all default behavior immediately for touch events
      e.preventDefault();
      e.stopPropagation();
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const clickedId = getClickedElementId(x, y);
    if (clickedId) {
      // Find the actual position
      const position = statPositions.find((pos) => pos.id === clickedId);
      if (!position) return;

      // Set up drag state
      setDragState({
        id: clickedId,
        offsetX: x - position.x,
        offsetY: y - position.y,
      });

      setIsDragging(true);
    }
  };

  return (
    <div className="space-y-8">
      {/* Canvas Preview */}
      <div className="space-y-4">
        <div className="w-full max-w-sm mx-auto relative" ref={containerRef}>
          <canvas
            ref={canvasRef}
            className={cn(
              "w-full rounded-lg cursor-default",
              isDragging && "cursor-move"
            )}
            style={{
              aspectRatio: "9/16",
              background:
                selectedGradient === "none"
                  ? isWhiteText
                    ? "#000"
                    : "#fff"
                  : `${isWhiteText ? "#000" : "#fff"} linear-gradient(135deg, ${
                      GRADIENTS.find((g) => g.id === selectedGradient)?.value
                        ?.from || "transparent"
                    }, ${
                      GRADIENTS.find((g) => g.id === selectedGradient)?.value
                        ?.to || "transparent"
                    })`,
              touchAction: "none", // Always disable browser touch actions on canvas
              WebkitUserSelect: "none", // Prevent text selection on iOS
              userSelect: "none", // Prevent text selection on all devices
            }}
            onMouseDown={handleCanvasPointerDown}
            onTouchStart={handleCanvasPointerDown}
          />

          {/* Dragging instructions */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <div
              className={cn(
                "bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center",
                isDragging ? "opacity-100" : "opacity-70"
              )}
            >
              <Move className="h-3 w-3 mr-1" />
              {isDragging
                ? "Dragging..."
                : isMobile
                ? "Tap on text elements to move them"
                : "Click on text elements to drag them"}
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-2">
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="text-xs font-medium"
          >
            <Share className="h-3.5 w-3.5 mr-1.5" />
            Share
          </Button>
          <Button
            onClick={() => setIsWhiteText(!isWhiteText)}
            variant="outline"
            size="sm"
            className="text-xs font-medium"
          >
            {isWhiteText ? (
              <Moon className="h-3.5 w-3.5" />
            ) : (
              <Sun className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Customization Controls - Make more responsive for mobile */}
      <div className="space-y-6">
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
                      } text-xs sm:text-sm py-1 h-auto min-h-[32px]`}
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
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Background */}
          <div className="space-y-2">
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
          <div className="space-y-2">
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
        <div className="space-y-2">
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
            <div className="pt-2 space-y-2">
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

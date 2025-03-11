import type { StravaActivity } from "@/lib/strava/activities";
import { formatDistance, formatTime } from "@/lib/utils/format";

export const STRAVA = {
  BRAND_COLOR: "#FC4C02",
  OAUTH_URL: "https://www.strava.com/oauth/authorize",
  MAIN_URL: "https://www.strava.com",
} as const;

export type StatOption = {
  id: string;
  label: string;
  available: boolean;
  getValue: (activity: StravaActivity) => string | null;
};

export const AVAILABLE_STATS: StatOption[] = [
  {
    id: "title",
    label: "Title",
    available: true,
    getValue: (a) => a.name,
  },
  {
    id: "distance",
    label: "Distance",
    available: true,
    getValue: (a) => formatDistance(a.distance),
  },
  {
    id: "time",
    label: "Moving Time",
    available: true,
    getValue: (a) => formatTime(a.moving_time),
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
] as const;

export const FONTS = [
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

export const GRADIENTS = [
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

export const FONT_SIZES = [
  { id: "xs", label: "XS", value: 0.6 },
  { id: "s", label: "S", value: 0.8 },
  { id: "m", label: "M", value: 1.0 },
  { id: "l", label: "L", value: 1.2 },
  { id: "xl", label: "XL", value: 1.4 },
] as const;

import {
  MdDirectionsBike,
  MdDirectionsRun,
  MdPool,
  MdTerrain,
  MdFitnessCenter,
  MdDirectionsWalk,
  MdSurfing,
  MdKitesurfing,
  MdSkateboarding,
  MdSportsHandball,
  MdHiking,
  MdSportsKabaddi,
  MdSportsGymnastics,
} from "react-icons/md";
import { FaSkiing, FaSkiingNordic } from "react-icons/fa";
import type { IconType } from "react-icons";

type ActivityType = {
  icon: IconType;
  label: string;
  color: string;
};

const activityTypes: Record<string, ActivityType> = {
  Ride: {
    icon: MdDirectionsBike,
    label: "Ride",
    color: "text-blue-500",
  },
  Run: {
    icon: MdDirectionsRun,
    label: "Run",
    color: "text-green-500",
  },
  Swim: {
    icon: MdPool,
    label: "Swim",
    color: "text-cyan-500",
  },
  Hike: {
    icon: MdHiking,
    label: "Hike",
    color: "text-amber-500",
  },
  WeightTraining: {
    icon: MdFitnessCenter,
    label: "Weight Training",
    color: "text-purple-500",
  },
  NordicSki: {
    icon: FaSkiingNordic,
    label: "Nordic Ski",
    color: "text-sky-500",
  },
  AlpineSki: {
    icon: FaSkiing,
    label: "Alpine Ski",
    color: "text-sky-600",
  },
  Walk: {
    icon: MdDirectionsWalk,
    label: "Walk",
    color: "text-teal-500",
  },
  Surfing: {
    icon: MdSurfing,
    label: "Surfing",
    color: "text-indigo-500",
  },
  Windsurf: {
    icon: MdKitesurfing,
    label: "Windsurf",
    color: "text-blue-400",
  },
  Skateboard: {
    icon: MdSkateboarding,
    label: "Skateboard",
    color: "text-orange-500",
  },
  Workout: {
    icon: MdSportsKabaddi,
    label: "Workout",
    color: "text-rose-500",
  },
  Yoga: {
    icon: MdSportsGymnastics,
    label: "Yoga",
    color: "text-violet-500",
  },
  CrossFit: {
    icon: MdSportsHandball,
    label: "CrossFit",
    color: "text-red-500",
  },
  RockClimbing: {
    icon: MdTerrain,
    label: "Rock Climbing",
    color: "text-stone-500",
  },
};

export function getActivityTypeInfo(type: string): ActivityType {
  return (
    activityTypes[type] || {
      icon: MdDirectionsWalk,
      label: type || "Activity",
      color: "text-gray-500",
    }
  );
}

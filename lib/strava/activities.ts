import { getValidStravaToken } from "@/lib/strava";

export type StravaActivity = {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  map: {
    summary_polyline: string;
  };
  average_speed: number;
  max_speed: number;
  average_watts?: number;
  max_watts?: number;
  weighted_average_watts?: number;
  kilojoules?: number;
  description?: string;
  calories?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  has_heartrate: boolean;
  suffer_score?: number;
  elev_high?: number;
  elev_low?: number;
  pr_count: number;
  achievement_count: number;
  kudos_count: number;
  athlete_count: number;
  device_name?: string;
  gear?: {
    id: string;
    name: string;
    distance: number;
  };
  splits_metric?: Array<{
    distance: number;
    elapsed_time: number;
    elevation_difference: number;
    moving_time: number;
    split: number;
    average_speed: number;
    pace_zone: number;
  }>;
};

export async function getActivities(userId: string): Promise<StravaActivity[]> {
  try {
    const token = await getValidStravaToken(userId);
    const response = await fetch(
      "https://www.strava.com/api/v3/athlete/activities?per_page=30",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const activities = await response.json();
    return activities;
  } catch (error) {
    console.error("Error fetching Strava activities:", error);
    return [];
  }
}

export async function getActivity(
  userId: string,
  activityId: string
): Promise<StravaActivity | null> {
  try {
    const token = await getValidStravaToken(userId);
    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const activity = await response.json();
    return activity;
  } catch (error) {
    console.error("Error fetching Strava activity:", error);
    return null;
  }
}

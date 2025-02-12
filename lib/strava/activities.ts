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
  kilojoules?: number;
  description?: string;
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

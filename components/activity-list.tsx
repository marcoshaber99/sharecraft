"use client";

import { StravaActivity } from "@/lib/strava/activities";
import { formatDistanceToNow } from "date-fns";
import { formatDistance, formatTime } from "@/lib/utils/format";
import { getActivityTypeInfo } from "@/lib/utils/activity-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export function ActivityList({ activities }: { activities: StravaActivity[] }) {
  if (!activities.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No activities found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {activities.map((activity) => {
        const { icon: Icon, color } = getActivityTypeInfo(activity.type);

        return (
          <Link
            key={activity.id}
            href={`/dashboard/activities/${activity.id}`}
            className="block transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Card className="flex flex-col h-full">
              <CardHeader className="flex-none p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className={`h-5 w-5 shrink-0 ${color}`} />
                    <CardTitle className="text-base truncate">
                      {activity.name}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs shrink-0">
                    {formatDistanceToNow(new Date(activity.start_date), {
                      addSuffix: true,
                    })}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-4 pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">
                      Distance
                    </p>
                    <p className="text-sm font-semibold">
                      {formatDistance(activity.distance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">
                      Time
                    </p>
                    <p className="text-sm font-semibold">
                      {formatTime(activity.moving_time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">
                      Elevation
                    </p>
                    <p className="text-sm font-semibold">
                      {activity.total_elevation_gain.toFixed(1)}m
                    </p>
                  </div>
                  {activity.average_watts && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">
                        Avg Power
                      </p>
                      <p className="text-sm font-semibold">
                        {activity.average_watts}W
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

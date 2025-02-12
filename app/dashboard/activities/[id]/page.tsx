import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getActivity } from "@/lib/strava/activities";
import { formatDistance, formatTime } from "@/lib/utils/format";
import { getActivityTypeInfo } from "@/lib/utils/activity-icons";
import { format } from "date-fns";
import { ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";

function formatSpeed(metersPerSecond: number): string {
  const kmPerHour = Math.round(metersPerSecond * 3.6 * 10) / 10;
  return `${kmPerHour.toFixed(1)} km/h`;
}

function formatPace(metersPerSecond: number): string {
  const minutesPerKm = 16.6667 / metersPerSecond;
  const minutes = Math.floor(minutesPerKm);
  const seconds = Math.round((minutesPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
}

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const { id } = await params;
  const activity = await getActivity(session.user.id, id);

  if (!activity) {
    redirect("/dashboard");
  }

  const { icon: Icon, color } = getActivityTypeInfo(activity.type);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Activities
          </Link>
        </div>

        <div className="flex items-start gap-4 mb-6">
          <Icon className={`h-8 w-8 mt-1 ${color}`} />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold mb-1 break-words">
              {activity.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
              <p>
                {format(
                  new Date(activity.start_date),
                  "MMMM d, yyyy 'at' h:mm a"
                )}
              </p>
              {activity.gear && (
                <p className="flex items-center gap-1">
                  Using {activity.gear.name}
                </p>
              )}
              {activity.device_name && <p>via {activity.device_name}</p>}
            </div>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground p-2">
            <TooltipProvider delayDuration={300}>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      <span>{activity.kudos_count}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Kudos received</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Distance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-2xl font-bold">
                    {formatDistance(activity.distance)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-2xl font-bold">
                    {formatTime(activity.moving_time)}
                  </p>
                  {activity.elapsed_time !== activity.moving_time && (
                    <p className="text-sm text-muted-foreground">
                      {formatTime(activity.elapsed_time)} elapsed
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Elevation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-2xl font-bold">
                    {activity.total_elevation_gain.toFixed(1)}m
                  </p>
                  {activity.elev_high && activity.elev_low && (
                    <p className="text-sm text-muted-foreground">
                      {activity.elev_low.toFixed(1)}m -{" "}
                      {activity.elev_high.toFixed(1)}m
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Speed
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-2xl font-bold">
                    {formatSpeed(activity.average_speed)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatPace(activity.average_speed)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {activity.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-muted-foreground">
                    {activity.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activity.average_watts && (
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Power
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">
                      {activity.weighted_average_watts ||
                        activity.average_watts}
                      W
                    </p>
                    {activity.max_watts && (
                      <p className="text-sm text-muted-foreground">
                        {activity.max_watts}W max
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {activity.has_heartrate && activity.average_heartrate && (
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Heart Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">
                      {Math.round(activity.average_heartrate)} bpm
                    </p>
                    {activity.max_heartrate && (
                      <p className="text-sm text-muted-foreground">
                        {Math.round(activity.max_heartrate)} bpm max
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {activity.average_cadence && (
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Cadence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">
                      {Math.round(activity.average_cadence)} rpm
                    </p>
                  </CardContent>
                </Card>
              )}

              {activity.calories && (
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Calories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{activity.calories}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {activity.splits_metric && activity.splits_metric.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Splits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-4 text-sm">
                    <div className="font-medium text-muted-foreground">
                      Split
                    </div>
                    <div className="font-medium text-muted-foreground">
                      Distance
                    </div>
                    <div className="font-medium text-muted-foreground">
                      Time
                    </div>
                    <div className="font-medium text-muted-foreground">
                      Speed
                    </div>
                    <div className="hidden md:block font-medium text-muted-foreground">
                      Elevation
                    </div>
                    <div className="hidden md:block font-medium text-muted-foreground">
                      Pace
                    </div>
                    {activity.splits_metric.map((split) => (
                      <React.Fragment key={split.split}>
                        <div className="text-foreground">{split.split}</div>
                        <div className="text-foreground">
                          {formatDistance(split.distance)}
                        </div>
                        <div className="text-foreground">
                          {formatTime(split.moving_time)}
                        </div>
                        <div className="text-foreground">
                          {formatSpeed(split.average_speed)}
                        </div>
                        <div className="hidden md:block text-foreground">
                          {split.elevation_difference > 0
                            ? `+${split.elevation_difference}m`
                            : `${split.elevation_difference}m`}
                        </div>
                        <div className="hidden md:block text-foreground">
                          {formatPace(split.average_speed)}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getActivities } from "@/lib/strava/activities";
import { ActivityList } from "@/components/activity-list";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  DashboardHeaderSkeleton,
  ActivitySkeleton,
} from "@/components/skeletons";
import { signOutAction } from "@/lib/actions";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const activities = await getActivities(session.user.id);

  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<DashboardHeaderSkeleton />}>
        <DashboardHeader user={session.user} signOutAction={signOutAction} />
      </Suspense>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <h2 className="font-semibold mb-4">Recent Activities</h2>
        <Suspense fallback={<ActivitySkeleton />}>
          <ActivityList activities={activities} />
        </Suspense>
      </div>
    </main>
  );
}

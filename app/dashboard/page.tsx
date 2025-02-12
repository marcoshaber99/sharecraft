import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getActivities } from "@/lib/strava/activities";
import { ActivityList } from "@/components/activity-list";
import { DashboardHeader } from "@/components/dashboard-header";
import { signOutAction } from "@/lib/actions";
import { Loader2 } from "lucide-react";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const activities = await getActivities(session.user.id);

  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<LoadingSpinner />}>
        <DashboardHeader user={session.user} signOutAction={signOutAction} />
      </Suspense>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <h2 className="font-semibold mb-4">Recent Activities</h2>
        <Suspense fallback={<LoadingSpinner />}>
          <ActivityList activities={activities} />
        </Suspense>
      </div>
    </main>
  );
}

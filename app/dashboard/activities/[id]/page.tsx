import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getActivity } from "@/lib/strava/activities";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ActivityCanvas } from "@/components/activity-canvas";

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

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-3xl">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Activities
          </Link>
        </div>

        <ActivityCanvas activity={activity} />
      </div>
    </main>
  );
}

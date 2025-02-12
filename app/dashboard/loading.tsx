import {
  DashboardHeaderSkeleton,
  ActivitySkeleton,
} from "@/components/skeletons";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      <DashboardHeaderSkeleton />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="h-5 w-36 mb-4">
          <div className="h-full w-full animate-pulse rounded-md bg-muted" />
        </div>
        <ActivitySkeleton />
      </div>
    </main>
  );
}

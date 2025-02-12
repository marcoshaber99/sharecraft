import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <main className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Image
            src={session.user?.image || ""}
            alt={session.user?.name || ""}
            className="rounded-full"
            width={64}
            height={64}
          />
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {session.user?.name}
            </h1>
            <p>{session.user?.email}</p>
          </div>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </form>
      </div>

      {/* We'll add activity data here later */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Recent Activities</h2>
          <p>Coming soon...</p>
        </div>
      </div>
    </main>
  );
}

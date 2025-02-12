import SignIn from "@/components/sign-in";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 relative">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <SignIn />
    </main>
  );
}

import { signIn } from "@/auth";
import Image from "next/image";

export default function SignIn() {
  return (
    <div className="flex flex-col items-center gap-8">
      <form
        action={async () => {
          "use server";
          await signIn("strava");
        }}
      >
        <button type="submit" className="hover:opacity-90 transition-opacity">
          <Image
            src="/strava/btn_strava_connectwith_orange.svg"
            alt="Connect with Strava"
            width={193}
            height={48}
            priority
          />
        </button>
      </form>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { signInAction } from "@/lib/actions";

function StravaButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="relative hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      {pending ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#FC4C02] rounded">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </div>
      ) : null}
      <Image
        src="/strava/btn_strava_connectwith_orange.svg"
        alt="Connect with Strava"
        width={193}
        height={48}
        priority
        className={pending ? "opacity-0" : ""}
      />
    </button>
  );
}

export default function SignIn() {
  return (
    <div className="flex flex-col items-center gap-8">
      <form action={signInAction}>
        <StravaButton />
      </form>
    </div>
  );
}

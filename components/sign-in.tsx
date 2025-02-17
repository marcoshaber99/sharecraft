"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";

export default function SignIn() {
  return (
    <button
      onClick={() => signIn("strava")}
      className="inline-flex items-center justify-center"
    >
      <Image
        src="/btn-strava-connect-orange.svg"
        alt="Connect with Strava"
        width={193}
        height={48}
      />
    </button>
  );
}

import { ArrowRight } from "lucide-react";
import SignIn from "./sign-in";
import { STRAVA } from "@/lib/constants";

export function Hero() {
  return (
    <section className="w-full max-w-5xl mx-auto px-6">
      <div className="flex flex-col items-center text-center space-y-10">
        <h1 className="text-4xl sm:text-5xl font-geist font-bold tracking-tight">
          Turn Your Activities into Social Cards
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
          Create beautiful, customizable images of your activities that are
          perfect for all social media platforms.
        </p>

        <div className="flex items-center gap-6 pt-2">
          <SignIn />
          <a
            href={STRAVA.MAIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 text-sm font-medium hover:text-[#FC4C02] transition-colors"
          >
            About Strava
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}

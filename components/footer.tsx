import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full border-t mt-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-4 flex items-center justify-center">
        <Image
          src="/powered-by-strava-light.svg"
          alt="Powered by Strava"
          width={140}
          height={40}
          className="dark:hidden"
        />
        <Image
          src="/powered-by-strava-gray.svg"
          alt="Powered by Strava"
          width={140}
          height={40}
          className="hidden dark:block"
        />
      </div>
    </footer>
  );
}

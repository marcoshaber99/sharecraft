import { z } from "zod";

const envSchema = z.object({
  AUTH_STRAVA_ID: z.string(),
  AUTH_STRAVA_SECRET: z.string(),
  AUTH_SECRET: z.string(),
  DATABASE_URL: z.string(),
  NEXT_PUBLIC_BASE_URL: z.string(),
});

export const env = envSchema.parse({
  AUTH_STRAVA_ID: process.env.AUTH_STRAVA_ID,
  AUTH_STRAVA_SECRET: process.env.AUTH_STRAVA_SECRET,
  AUTH_SECRET: process.env.AUTH_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
});

import { db } from "@/lib/db/schema";
import { env } from "@/env";
import { eq } from "drizzle-orm";
import { accounts } from "./db/schema";

export async function getValidStravaToken(userId: string) {
  // Get the current Strava account
  const account = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .limit(1)
    .then((res) => res[0]);

  if (!account) {
    throw new Error("No Strava account found");
  }

  // Check if token needs refresh (expiring in less than 5 minutes)
  const expiresAt = account.expires_at ? account.expires_at * 1000 : 0; // Convert to milliseconds
  const needsRefresh = Date.now() + 300000 > expiresAt; // 300000ms = 5 minutes

  if (!needsRefresh) {
    return account.access_token;
  }

  // Token needs refresh
  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: env.AUTH_STRAVA_ID,
      client_secret: env.AUTH_STRAVA_SECRET,
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  const data = await response.json();

  // Update the tokens in the database
  await db
    .update(accounts)
    .set({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    })
    .where(eq(accounts.userId, userId));

  return data.access_token;
}

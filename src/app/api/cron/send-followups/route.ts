import { NextResponse } from "next/server";
import { runEligibleFollowups } from "@/server/services/followup-runner";

export async function POST(request: Request) {
  const rawAuth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (process.env.NODE_ENV !== "production") {
    console.info("[cron/send-followups] CRON_SECRET loaded:", Boolean(cronSecret));
  }

  const [scheme, token] = rawAuth?.trim().split(/\s+/, 2) ?? [];
  const isBearer = typeof scheme === "string" && scheme.toLowerCase() === "bearer";
  const isAuthorized = Boolean(cronSecret) && isBearer && token === cronSecret;

  if (!isAuthorized) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[cron/send-followups] Unauthorized request", {
        hasAuthorizationHeader: Boolean(rawAuth),
        authorizationScheme: scheme ?? null,
        hasCronSecret: Boolean(cronSecret)
      });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await runEligibleFollowups());
}

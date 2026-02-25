import { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const { GET } = handlers;

// Wrap POST to add rate limiting on login attempts
export async function POST(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/");
  const isSignIn = segments.includes("callback") && segments.includes("credentials");

  if (isSignIn) {
    const rateLimited = rateLimit(request, RATE_LIMITS.login, "login");
    if (rateLimited) return rateLimited;
  }

  return handlers.POST(request);
}

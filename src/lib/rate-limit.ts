import { NextResponse } from "next/server";

/**
 * Simple in-memory rate limiter using a sliding window.
 * Good enough for a single-instance deployment (Vercel serverless has
 * per-isolate memory, so this provides per-instance protection).
 *
 * For multi-instance production, swap to Upstash Redis (@upstash/ratelimit).
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  /** Milliseconds until the oldest request expires from the window */
  retryAfterMs: number;
}

/**
 * Check rate limit for a given key.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  cleanup(config.windowMs);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  const cutoff = now - config.windowMs;
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= config.limit) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + config.windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      limit: config.limit,
      retryAfterMs: Math.max(retryAfterMs, 0),
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: config.limit - entry.timestamps.length,
    limit: config.limit,
    retryAfterMs: 0,
  };
}

/**
 * Build a rate-limit key from a request.
 * Uses x-forwarded-for (Vercel/proxy), then x-real-ip, then falls back to "unknown".
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

/**
 * Pre-configured rate limiters for different endpoints.
 */
export const RATE_LIMITS = {
  /** SMS send: 20 per minute per IP */
  smsSend: { limit: 20, windowMs: 60 * 1000 },
  /** Bulk SMS: 5 per minute per IP */
  smsBulk: { limit: 5, windowMs: 60 * 1000 },
  /** Login attempts: 10 per 15 minutes per IP */
  login: { limit: 10, windowMs: 15 * 60 * 1000 },
  /** Registration: 5 per hour per IP */
  register: { limit: 5, windowMs: 60 * 60 * 1000 },
  /** Lead capture: 10 per minute per IP */
  leads: { limit: 10, windowMs: 60 * 1000 },
  /** Password reset requests: 5 per 15 minutes per IP */
  passwordReset: { limit: 5, windowMs: 15 * 60 * 1000 },
} as const;

/**
 * Returns a 429 response if rate limited, or null if allowed.
 * Attach to API routes at the top of the handler.
 */
export function rateLimit(
  request: Request,
  config: RateLimitConfig,
  /** Optional prefix to namespace the rate limit key */
  prefix = "global"
): NextResponse | null {
  const ip = getClientIp(request);
  const key = `${prefix}:${ip}`;
  const result = checkRateLimit(key, config);

  if (!result.allowed) {
    const retryAfterSeconds = Math.ceil(result.retryAfterMs / 1000);
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter: retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null;
}

/**
 * KeralamMatch — Distributed Rate Limiter
 * Supports Upstash Redis REST / Redis URI with in-memory fallback.
 * Enforces production limits across auth, OTP, chat, requests, media, and admin routes.
 */

const memoryStore = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds = 60
): Promise<RateLimitResult> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_TOKEN;

  // Try Upstash Redis REST if configured
  if (redisUrl && redisToken && redisUrl.startsWith("https://")) {
    try {
      const key = `ratelimit:${identifier}`;
      const res = await fetch(`${redisUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["EXPIRE", key, windowSeconds],
        ]),
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        const count = data[0]?.result || 1;
        const remaining = Math.max(0, limit - count);
        return {
          success: count <= limit,
          limit,
          remaining,
          resetSeconds: windowSeconds,
        };
      }
    } catch {
      // Fallback to in-memory on connection failure
    }
  }

  // In-memory fallback
  const now = Date.now();
  const record = memoryStore.get(identifier);

  if (!record || now > record.resetAt) {
    memoryStore.set(identifier, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { success: true, limit, remaining: limit - 1, resetSeconds: windowSeconds };
  }

  if (record.count >= limit) {
    const resetSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { success: false, limit, remaining: 0, resetSeconds };
  }

  record.count++;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    resetSeconds: Math.ceil((record.resetAt - now) / 1000),
  };
}

/**
 * KeralamMatch — Distributed Rate Limiter
 *
 * When UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are configured,
 * rate limiting is distributed across all serverless instances (correct behaviour).
 *
 * When those env vars are NOT set, the fallback is an in-memory Map.
 * In serverless environments (Vercel), each lambda instance has its own memory,
 * so in-memory counters are NOT shared — rate limits are effectively per-instance.
 *
 * ⚠️  ACTION REQUIRED: Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 *     in your Vercel environment variables before production launch.
 *     See: https://console.upstash.com → Create Redis Database → REST API keys
 */

const isDeployed =
  process.env.NODE_ENV === "production" ||
  !!process.env.VERCEL;

const hasRedis =
  !!(process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_URL) &&
  !!(process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_TOKEN);

if (isDeployed && !hasRedis) {
  console.warn(
    "[rate-limiter] WARNING: Upstash Redis is NOT configured. " +
    "Rate limiting is falling back to per-instance in-memory counters. " +
    "This is NOT effective across serverless instances. " +
    "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel environment variables."
  );
}

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

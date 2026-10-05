/**
 * Minimal in-memory fixed-window limiter (single instance only).
 * TODO(Phase 2): move to Postgres/Redis when running more than one web container.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function isRateLimited(key: string, limit: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) return false;
  return b.count >= limit;
}

export function recordFailure(key: string, windowMs: number): void {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    b.count++;
  }
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }
}

export function clearFailures(key: string): void {
  buckets.delete(key);
}

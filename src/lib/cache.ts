// ── Module-level cache for read-only Firestore queries ──────────────
// Shared by client actions (src/actions/actions.ts) and the server-only
// data layer (src/lib/queries.ts). NOTE: the Map is per-process — on the
// server it is per-instance and resets on cold start/redeploy. Acceptable
// for public catalog reads with short TTLs (2–5 min). Intentionally NOT
// marked "server-only" so the client bundle can use it too.

const memoryCache = new Map<string, { data: unknown; expiry: number }>();
const inFlight = new Map<string, Promise<unknown>>();

/**
 * Cache successful fetcher results. Errors are never cached (so a blip
 * doesn't blank Home/Categories for the full TTL). Concurrent callers for
 * the same key share one in-flight promise.
 */
export function withCache<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = memoryCache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return Promise.resolve(cached.data as T);
  }

  const pending = inFlight.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const request = fetcher()
    .then((data) => {
      memoryCache.set(key, { data, expiry: Date.now() + ttlMs });
      return data;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request);
  return request;
}

/** Invalidate cache entries whose key starts with `keyPrefix` (call after mutations). */
export function invalidateCache(keyPrefix: string) {
  for (const key of memoryCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      memoryCache.delete(key);
    }
  }
}

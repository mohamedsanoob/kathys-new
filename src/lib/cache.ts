// ── Module-level cache for read-only Firestore queries ──────────────
// Shared by client actions (src/actions/actions.ts) and the server-only
// data layer (src/lib/queries.ts). NOTE: the Map is per-process — on the
// server it is per-instance and resets on cold start/redeploy. Acceptable
// for public catalog reads with short TTLs (2–5 min). Intentionally NOT
// marked "server-only" so the client bundle can use it too.

const memoryCache = new Map<string, { data: any; expiry: number }>();

export function withCache<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = memoryCache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return Promise.resolve(cached.data as T);
  }
  return fetcher().then((data) => {
    memoryCache.set(key, { data, expiry: Date.now() + ttlMs });
    return data;
  });
}

/** Invalidate cache entries whose key starts with `keyPrefix` (call after mutations). */
export function invalidateCache(keyPrefix: string) {
  for (const key of memoryCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      memoryCache.delete(key);
    }
  }
}

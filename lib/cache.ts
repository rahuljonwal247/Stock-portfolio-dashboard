// lib/cache.ts
import NodeCache from "node-cache";

// Primary cache: 15 seconds TTL (matches refresh interval)
const cache = new NodeCache({ stdTTL: 15, checkperiod: 10 });

// Stale cache: holds last known good values for up to 5 minutes
const staleCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<{ value: T; isStale: boolean }> {
  // Check primary cache first
  const cached = cache.get<T>(key);
  if (cached !== undefined) {
    return { value: cached, isStale: false };
  }

  try {
    const fresh = await fetcher();
    cache.set(key, fresh);
    staleCache.set(key, fresh); // Update stale cache with fresh value
    return { value: fresh, isStale: false };
  } catch (error) {
    // Fetcher failed — try stale cache
    const stale = staleCache.get<T>(key);
    if (stale !== undefined) {
      console.warn(`[Cache] Using stale value for key: ${key}`);
      return { value: stale, isStale: true };
    }
    throw error; // No stale value either
  }
}

export function clearCache(key?: string) {
  if (key) {
    cache.del(key);
  } else {
    cache.flushAll();
  }
}

const cacheStore = new Map<string, { data: any; expires: number }>();

const CACHE_TTL = parseInt(process.env.CDN_CACHE_TTL || '300', 10) * 1000;

export function getCached(key: string): any | null {
  const cached = cacheStore.get(key);
  if (!cached) {
    return null;
  }

  if (Date.now() > cached.expires) {
    cacheStore.delete(key);
    return null;
  }

  return cached.data;
}

export function setCached(key: string, data: any, ttl: number = CACHE_TTL): void {
  cacheStore.set(key, {
    data,
    expires: Date.now() + ttl,
  });
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cacheStore.clear();
    return;
  }

  for (const key of cacheStore.keys()) {
    if (key.includes(pattern)) {
      cacheStore.delete(key);
    }
  }
}


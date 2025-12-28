interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMITS = {
  perFingerprint: { count: 10, windowMs: 3600000 },
  perIP: { count: 50, windowMs: 3600000 },
};

function getKey(type: 'fingerprint' | 'ip', value: string): string {
  return `${type}:${value}`;
}

function checkLimit(key: string, limit: { count: number; windowMs: number }): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + limit.windowMs,
    });
    return true;
  }

  if (entry.count >= limit.count) {
    return false;
  }

  entry.count++;
  return true;
}

export function checkRateLimit(fingerprint: string, ip: string): { allowed: boolean; reason?: string } {
  const fingerprintKey = getKey('fingerprint', fingerprint);
  const ipKey = getKey('ip', ip);

  if (!checkLimit(fingerprintKey, RATE_LIMITS.perFingerprint)) {
    return { allowed: false, reason: 'Fingerprint rate limit exceeded' };
  }

  if (!checkLimit(ipKey, RATE_LIMITS.perIP)) {
    return { allowed: false, reason: 'IP rate limit exceeded' };
  }

  return { allowed: true };
}

export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}


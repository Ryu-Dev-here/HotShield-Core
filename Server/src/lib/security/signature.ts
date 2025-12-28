import crypto from 'crypto';

const HMAC_SECRET = process.env.HMAC_SECRET || '';

if (!HMAC_SECRET) {
  console.warn('HMAC_SECRET not set, signature validation will fail');
}

export function generateSignature(body: string, timestamp: string): string {
  const data = `${body}:${timestamp}`;
  return crypto.createHmac('sha256', HMAC_SECRET).update(data).digest('hex');
}

export function validateSignature(
  body: string,
  timestamp: string,
  signature: string
): boolean {
  if (!HMAC_SECRET) {
    return false;
  }

  const expectedSignature = generateSignature(body, timestamp);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export function validateTimestamp(timestamp: string, maxAgeSeconds: number = 300): boolean {
  const requestTime = parseInt(timestamp, 10);
  if (isNaN(requestTime)) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const age = now - requestTime;

  return age >= 0 && age <= maxAgeSeconds;
}


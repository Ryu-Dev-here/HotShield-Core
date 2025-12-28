import crypto from 'crypto';

export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function hashProof(proofUrl: string, content?: string): string {
  const data = content ? `${proofUrl}:${content}` : proofUrl;
  return sha256(data);
}


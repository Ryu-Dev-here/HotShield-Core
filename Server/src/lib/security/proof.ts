const ALLOWED_DOMAINS = (process.env.ALLOWED_PROOF_DOMAINS || '')
  .split(',')
  .map((d) => d.trim().toLowerCase())
  .filter((d) => d.length > 0);

const BLOCKED_DOMAINS = [
  'trustmebro.com',
  'fake-proof.com',
  'localhost',
  '127.0.0.1',
];

export function validateProofDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    if (BLOCKED_DOMAINS.some((blocked) => hostname.includes(blocked))) {
      return false;
    }

    if (ALLOWED_DOMAINS.length === 0) {
      return true;
    }

    return ALLOWED_DOMAINS.some((allowed) => hostname.includes(allowed) || hostname.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

export function validateProofLinks(proofLinks: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const link of proofLinks) {
    if (validateProofDomain(link)) {
      valid.push(link);
    } else {
      invalid.push(link);
    }
  }

  return { valid, invalid };
}


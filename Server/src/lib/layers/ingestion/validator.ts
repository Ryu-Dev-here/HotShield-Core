import { FlagRequest, flagRequestSchema } from '@/lib/utils/validation';
import { validateSignature, validateTimestamp } from '@/lib/security/signature';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { validateProofLinks } from '@/lib/security/proof';
import { resolveUuidFromUsername, isValidUUID } from '@/lib/utils/uuid';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  targetUuid?: string;
  normalizedDescription?: string;
  validProofLinks?: string[];
}

export async function validateFlagRequest(
  body: string,
  signature: string,
  timestamp: string,
  fingerprint: string,
  ip: string
): Promise<ValidationResult> {
  if (!validateTimestamp(timestamp)) {
    return { valid: false, error: 'Invalid or expired timestamp' };
  }

  if (!validateSignature(body, timestamp, signature)) {
    return { valid: false, error: 'Invalid signature' };
  }

  const rateLimitCheck = checkRateLimit(fingerprint, ip);
  if (!rateLimitCheck.allowed) {
    return { valid: false, error: rateLimitCheck.reason };
  }

  let parsed: FlagRequest;
  try {
    parsed = flagRequestSchema.parse(JSON.parse(body));
  } catch (error) {
    return { valid: false, error: 'Invalid request format' };
  }

  let targetUuid: string | null = null;
  if (parsed.targetUuid) {
    if (!isValidUUID(parsed.targetUuid)) {
      return { valid: false, error: 'Invalid UUID format' };
    }
    targetUuid = parsed.targetUuid;
  } else if (parsed.targetUsername) {
    targetUuid = await resolveUuidFromUsername(parsed.targetUsername);
    if (!targetUuid) {
      return { valid: false, error: 'Could not resolve UUID from username' };
    }
  } else {
    return { valid: false, error: 'Either targetUuid or targetUsername required' };
  }

  const proofValidation = validateProofLinks(parsed.proofLinks);
  if (proofValidation.valid.length === 0 && parsed.proofLinks.length > 0) {
    return { valid: false, error: 'No valid proof links provided' };
  }

  return {
    valid: true,
    targetUuid,
    normalizedDescription: parsed.description,
    validProofLinks: proofValidation.valid,
  };
}


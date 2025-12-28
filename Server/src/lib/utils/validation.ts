import { z } from 'zod';

export const flagRequestSchema = z.object({
  targetUuid: z.string().uuid().optional(),
  targetUsername: z.string().min(1).max(16).optional(),
  category: z.enum(['TRADE_SCAM', 'FAKE_MIDDLEMAN', 'ACCOUNT_SCAM', 'COIN_SCAM', 'OTHER']),
  description: z.string().min(1).max(5000),
  proofLinks: z.array(z.string().url()).max(10),
  reporterFingerprint: z.string().min(1),
  timestamp: z.string(),
});

export type FlagRequest = z.infer<typeof flagRequestSchema>;


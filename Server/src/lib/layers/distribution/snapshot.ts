import { Case, Verdict } from '@/lib/types/case';

export interface ScammerSnapshot {
  uuid: string;
  status: 'VERIFIED' | 'PENDING' | 'DISPUTED';
  confidence: number;
  reasonTags: string[];
  lastUpdated: string;
}

export function caseToSnapshot(caseData: Case): ScammerSnapshot | null {
  if (caseData.verdict === Verdict.CLEAN || caseData.verdict === Verdict.CLEARED) {
    return null;
  }

  const statusMap: Record<Verdict, 'VERIFIED' | 'PENDING' | 'DISPUTED' | null> = {
    [Verdict.VERIFIED]: 'VERIFIED',
    [Verdict.PENDING]: 'PENDING',
    [Verdict.DISPUTED]: 'DISPUTED',
    [Verdict.CLEAN]: null,
    [Verdict.CLEARED]: null,
  };

  const status = statusMap[caseData.verdict];
  if (!status) {
    return null;
  }

  const reasonTags = caseData.patternMatches || [];

  return {
    uuid: caseData.targetUuid,
    status,
    confidence: caseData.confidence,
    reasonTags,
    lastUpdated: caseData.lastUpdated,
  };
}


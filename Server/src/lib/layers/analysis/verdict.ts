import { Case, Verdict, StateTransition } from '@/lib/types/case';
import { Report } from '@/lib/types/report';

export function determineVerdict(
  caseData: Case,
  totalWeight: number,
  reportCount: number,
  trustedReporterCount: number
): Verdict {
  if (caseData.verdict === Verdict.CLEARED) {
    return Verdict.CLEARED;
  }

  if (reportCount === 0 || totalWeight < 30) {
    return Verdict.CLEAN;
  }

  if (totalWeight >= 70 && trustedReporterCount >= 2 && reportCount >= 3) {
    if (caseData.verdict === Verdict.VERIFIED) {
      const disputedReports = caseData.reports.filter((_, i) => {
        return false;
      });
      if (disputedReports.length > 0 && trustedReporterCount >= 3) {
        return Verdict.DISPUTED;
      }
    }
    return Verdict.VERIFIED;
  }

  if (totalWeight >= 40 || reportCount >= 2) {
    return Verdict.PENDING;
  }

  return Verdict.CLEAN;
}

export function calculateConfidence(
  totalWeight: number,
  reportCount: number,
  reporterDiversity: number
): number {
  let confidence = Math.min(100, totalWeight);

  const diversityBonus = Math.min(20, reporterDiversity * 2);
  confidence += diversityBonus;

  const countBonus = Math.min(15, reportCount * 3);
  confidence += countBonus;

  return Math.max(0, Math.min(100, confidence));
}

export function createStateTransition(
  from: Verdict,
  to: Verdict,
  reason?: string,
  actor?: string
): StateTransition {
  return {
    from,
    to,
    timestamp: new Date().toISOString(),
    reason,
    actor,
  };
}


import { Report } from '@/lib/types/report';
import { Reporter } from '@/lib/db/models/Reporter';
import { getTrustWeight } from './trust';

export interface WeightComponents {
  trustScore: number;
  proofQuality: number;
  proofUniqueness: number;
  categorySeverity: number;
  correlation: number;
  total: number;
}

const CATEGORY_SEVERITY: Record<string, number> = {
  TRADE_SCAM: 10,
  FAKE_MIDDLEMAN: 8,
  ACCOUNT_SCAM: 7,
  COIN_SCAM: 9,
  OTHER: 5,
};

export async function calculateReportWeight(
  report: Report,
  reporter: Reporter,
  existingReports: Report[]
): Promise<WeightComponents> {
  const trustScore = getTrustWeight(reporter);

  let proofQuality = 0;
  if (report.proofLinks.length > 0) {
    proofQuality = Math.min(20, report.proofLinks.length * 4);
  }

  let proofUniqueness = 15;
  for (const hash of report.proofHashes) {
    const reportsWithSameProof = existingReports.filter((r) =>
      r.proofHashes.includes(hash)
    );
    if (reportsWithSameProof.length > 1) {
      proofUniqueness -= 3;
    }
  }
  proofUniqueness = Math.max(0, proofUniqueness);

  const categorySeverity = CATEGORY_SEVERITY[report.category] || 5;

  let correlation = 0;
  const sameCategoryReports = existingReports.filter(
    (r) => r.category === report.category
  );
  if (sameCategoryReports.length > 0) {
    correlation = Math.min(5, sameCategoryReports.length);
  }

  const total = trustScore + proofQuality + proofUniqueness + categorySeverity + correlation;

  return {
    trustScore,
    proofQuality,
    proofUniqueness,
    categorySeverity,
    correlation,
    total: Math.max(0, Math.min(100, total)),
  };
}


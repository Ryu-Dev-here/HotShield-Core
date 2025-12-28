import { getDatabase } from '@/lib/db/mongodb';
import { ReportModel } from '@/lib/db/models/Report';
import { ReporterModel } from '@/lib/db/models/Reporter';

export interface AbusePattern {
  type: string;
  severity: 'low' | 'medium' | 'high';
  detected: boolean;
}

export async function detectAbuse(
  fingerprint: string,
  proofHashes: string[],
  timestamp: string,
  ip?: string
): Promise<AbusePattern[]> {
  const patterns: AbusePattern[] = [];
  const db = await getDatabase();
  const reportModel = new ReportModel(db);
  const reporterModel = new ReporterModel(db);

  const recentReports = await reportModel.findByReporterFingerprint(fingerprint, 10);
  const reporter = await reporterModel.findByFingerprint(fingerprint);

  if (recentReports.length >= 5) {
    const timeWindow = 60000;
    const recent = recentReports.filter(
      (r) => new Date(r.timestamp).getTime() > new Date(timestamp).getTime() - timeWindow
    );

    if (recent.length >= 5) {
      patterns.push({
        type: 'MASS_FLAG_BURST',
        severity: 'high',
        detected: true,
      });
    }
  }

  for (const proofHash of proofHashes) {
    const reportsWithSameProof = await reportModel.findByProofHash(proofHash);
    if (reportsWithSameProof.length > 3) {
      patterns.push({
        type: 'PROOF_REUSE_SPAM',
        severity: 'medium',
        detected: true,
      });
      break;
    }
  }

  if (reporter?.abuseFlags.length && reporter.abuseFlags.length > 2) {
    patterns.push({
      type: 'REPEAT_OFFENDER',
      severity: 'high',
      detected: true,
    });
  }

  return patterns;
}

export async function handleAbuse(
  fingerprint: string,
  patterns: AbusePattern[]
): Promise<void> {
  const db = await getDatabase();
  const reporterModel = new ReporterModel(db);

  const highSeverity = patterns.filter((p) => p.severity === 'high');
  if (highSeverity.length > 0) {
    for (const pattern of highSeverity) {
      await reporterModel.addAbuseFlag(fingerprint, pattern.type);
    }
    await reporterModel.setShadowBanned(fingerprint, true);
    await reporterModel.adjustTrustScore(fingerprint, -20);
  } else {
    for (const pattern of patterns) {
      await reporterModel.addAbuseFlag(fingerprint, pattern.type);
    }
  }
}


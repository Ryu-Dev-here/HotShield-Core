import { getDatabase } from '@/lib/db/mongodb';
import { ReportModel } from '@/lib/db/models/Report';
import { CaseModel } from '@/lib/db/models/Case';
import { ReporterModel } from '@/lib/db/models/Reporter';
import { AuditLogModel, AuditAction } from '@/lib/db/models/AuditLog';
import { calculateReportWeight } from './weight';
import { determineVerdict, calculateConfidence, createStateTransition } from './verdict';
import { ReportStatus, Report } from '@/lib/types/report';
import { Case, Verdict } from '@/lib/types/case';

export async function processQueuedReports(): Promise<void> {
  const db = await getDatabase();
  const reportModel = new ReportModel(db);
  const caseModel = new CaseModel(db);
  const reporterModel = new ReporterModel(db);
  const auditLogModel = new AuditLogModel(db);

  const queuedReports = await reportModel.findQueued();

  for (const report of queuedReports) {
    try {
      await reportModel.updateStatus(report.reportId, ReportStatus.PROCESSING);

      const reporter = await reporterModel.findByFingerprint(report.reporterFingerprint);
      if (!reporter || reporter.shadowBanned) {
        await reportModel.updateStatus(report.reportId, ReportStatus.WEIGHTED, 0);
        continue;
      }

      const existingCase = await caseModel.findByUuid(report.targetUuid);
      const existingReports = existingCase
        ? await reportModel.findByTargetUuid(report.targetUuid)
        : [];

      const weightComponents = await calculateReportWeight(report, reporter, existingReports);
      await reportModel.updateStatus(report.reportId, ReportStatus.WEIGHTED, weightComponents.total);

      const allReports = [...existingReports, report];
      const totalWeight = allReports.reduce((sum, r) => sum + (r.weight || 0), 0);
      const uniqueReporters = new Set(allReports.map((r) => r.reporterFingerprint));
      const trustedReporters = allReports.filter((r) => {
        const rep = existingReports.find((er) => er.reporterFingerprint === r.reporterFingerprint);
        return rep ? (rep.weight || 0) > 40 : false;
      });

      const proofOverlap: Record<string, number> = {};
      for (const r of allReports) {
        for (const hash of r.proofHashes) {
          proofOverlap[hash] = (proofOverlap[hash] || 0) + 1;
        }
      }

      const patternMatches: string[] = [];
      if (allReports.length >= 3) {
        patternMatches.push('MULTIPLE_REPORTS');
      }
      if (Object.values(proofOverlap).some((count) => count > 1)) {
        patternMatches.push('PROOF_OVERLAP');
      }

      const confidence = calculateConfidence(
        totalWeight,
        allReports.length,
        uniqueReporters.size
      );

      const newVerdict = determineVerdict(
        existingCase || {
          targetUuid: report.targetUuid,
          verdict: Verdict.CLEAN,
          confidence: 0,
          reports: [],
          timeline: [],
          proofOverlap: {},
          reporterDiversity: [],
          patternMatches: [],
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        totalWeight,
        allReports.length,
        trustedReporters.length
      );

      const updatedCase: Case = {
        targetUuid: report.targetUuid,
        verdict: newVerdict,
        confidence,
        reports: allReports.map((r) => r.reportId),
        timeline: existingCase
          ? [
              ...existingCase.timeline,
              createStateTransition(existingCase.verdict, newVerdict, 'Analysis engine'),
            ]
          : [createStateTransition(Verdict.CLEAN, newVerdict, 'Initial report')],
        proofOverlap,
        reporterDiversity: Array.from(uniqueReporters),
        patternMatches,
        lastUpdated: new Date().toISOString(),
        createdAt: existingCase?.createdAt || new Date().toISOString(),
      };

      await caseModel.update(updatedCase);

      if (existingCase && existingCase.verdict !== newVerdict) {
        await auditLogModel.log({
          action: AuditAction.STATE_TRANSITION,
          actor: 'system',
          target: report.targetUuid,
          beforeState: existingCase.verdict,
          afterState: newVerdict,
          timestamp: new Date().toISOString(),
          metadata: { reportId: report.reportId, confidence },
        });
      }

      if (newVerdict === Verdict.VERIFIED) {
        await reporterModel.adjustTrustScore(report.reporterFingerprint, 5);
        const updatedReporter = await reporterModel.findByFingerprint(report.reporterFingerprint);
        if (updatedReporter) {
          updatedReporter.verifiedCount++;
          await reporterModel.update(updatedReporter);
        }
      }
    } catch (error) {
      console.error(`Error processing report ${report.reportId}:`, error);
      await reportModel.updateStatus(report.reportId, ReportStatus.QUEUED);
    }
  }
}


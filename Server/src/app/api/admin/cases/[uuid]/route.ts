import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/layers/control';
import { getDatabase } from '@/lib/db/mongodb';
import { CaseModel } from '@/lib/db/models/Case';
import { ReportModel } from '@/lib/db/models/Report';
import { ReporterModel } from '@/lib/db/models/Reporter';

export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDatabase();
    const caseModel = new CaseModel(db);
    const reportModel = new ReportModel(db);
    const reporterModel = new ReporterModel(db);

    const caseData = await caseModel.findByUuid(params.uuid);
    if (!caseData) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const reports = await Promise.all(
      caseData.reports.map((reportId) => reportModel.findByReportId(reportId))
    );

    const reporters = await Promise.all(
      reports
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .map((r) => reporterModel.findByFingerprint(r.reporterFingerprint))
    );

    return NextResponse.json({
      case: caseData,
      reports: reports.filter((r): r is NonNullable<typeof r> => r !== null),
      reporters: reporters.filter((r): r is NonNullable<typeof r> => r !== null),
    });
  } catch (error) {
    console.error('Error fetching case:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


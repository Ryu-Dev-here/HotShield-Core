import { getDatabase } from '@/lib/db/mongodb';
import { ReportModel } from '@/lib/db/models/Report';
import { Report, ReportStatus } from '@/lib/types/report';

export async function queueReport(report: Report): Promise<void> {
  const db = await getDatabase();
  const reportModel = new ReportModel(db);
  await reportModel.create(report);
}


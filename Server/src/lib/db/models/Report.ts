import { Collection, Db } from 'mongodb';
import { Report, ReportStatus } from '@/lib/types/report';

export class ReportModel {
  private collection: Collection<Report>;

  constructor(db: Db) {
    this.collection = db.collection<Report>('reports');
    this.ensureIndexes();
  }

  private async ensureIndexes() {
    await this.collection.createIndex({ reportId: 1 }, { unique: true });
    await this.collection.createIndex({ targetUuid: 1 });
    await this.collection.createIndex({ reporterFingerprint: 1 });
    await this.collection.createIndex({ status: 1 });
    await this.collection.createIndex({ timestamp: -1 });
    await this.collection.createIndex({ 'proofHashes': 1 });
  }

  async create(report: Report): Promise<void> {
    await this.collection.insertOne(report);
  }

  async findByReportId(reportId: string): Promise<Report | null> {
    return this.collection.findOne({ reportId });
  }

  async findByTargetUuid(targetUuid: string): Promise<Report[]> {
    return this.collection.find({ targetUuid }).toArray();
  }

  async findQueued(): Promise<Report[]> {
    return this.collection.find({ status: ReportStatus.QUEUED }).toArray();
  }

  async updateStatus(reportId: string, status: ReportStatus, weight?: number): Promise<void> {
    const update: any = { status };
    if (weight !== undefined) {
      update.weight = weight;
    }
    await this.collection.updateOne({ reportId }, { $set: update });
  }

  async findByProofHash(proofHash: string): Promise<Report[]> {
    return this.collection.find({ proofHashes: proofHash }).toArray();
  }

  async findByReporterFingerprint(fingerprint: string, limit: number = 100): Promise<Report[]> {
    return this.collection
      .find({ reporterFingerprint: fingerprint })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }
}


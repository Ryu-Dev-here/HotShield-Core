import { Collection, Db } from 'mongodb';
import { Case, Verdict } from '@/lib/types/case';

export class CaseModel {
  private collection: Collection<Case>;

  constructor(db: Db) {
    this.collection = db.collection<Case>('cases');
    this.ensureIndexes();
  }

  private async ensureIndexes() {
    await this.collection.createIndex({ targetUuid: 1 }, { unique: true });
    await this.collection.createIndex({ verdict: 1 });
    await this.collection.createIndex({ confidence: -1 });
    await this.collection.createIndex({ lastUpdated: -1 });
  }

  async create(caseData: Case): Promise<void> {
    await this.collection.insertOne(caseData);
  }

  async findByUuid(targetUuid: string): Promise<Case | null> {
    return this.collection.findOne({ targetUuid });
  }

  async update(caseData: Case): Promise<void> {
    await this.collection.updateOne(
      { targetUuid: caseData.targetUuid },
      { $set: caseData },
      { upsert: true }
    );
  }

  async findAllByVerdict(verdict: Verdict): Promise<Case[]> {
    return this.collection.find({ verdict }).toArray();
  }

  async findAllVerifiedAndPending(): Promise<Case[]> {
    return this.collection
      .find({ verdict: { $in: [Verdict.VERIFIED, Verdict.PENDING] } })
      .toArray();
  }

  async updateVerdict(
    targetUuid: string,
    newVerdict: Verdict,
    transition: Case['timeline'][0]
  ): Promise<void> {
    await this.collection.updateOne(
      { targetUuid },
      {
        $set: {
          verdict: newVerdict,
          lastUpdated: new Date().toISOString(),
        },
        $push: {
          timeline: transition,
        },
      }
    );
  }
}


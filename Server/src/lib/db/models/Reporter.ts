import { Collection, Db } from 'mongodb';

export interface Reporter {
  fingerprint: string;
  trustScore: number;
  reportCount: number;
  verifiedCount: number;
  clearedCount: number;
  abuseFlags: string[];
  shadowBanned: boolean;
  lastReportTime?: string;
  createdAt: string;
}

export class ReporterModel {
  private collection: Collection<Reporter>;

  constructor(db: Db) {
    this.collection = db.collection<Reporter>('reporters');
    this.ensureIndexes();
  }

  private async ensureIndexes() {
    await this.collection.createIndex({ fingerprint: 1 }, { unique: true });
    await this.collection.createIndex({ trustScore: -1 });
    await this.collection.createIndex({ shadowBanned: 1 });
  }

  async findOrCreate(fingerprint: string): Promise<Reporter> {
    const existing = await this.collection.findOne({ fingerprint });
    if (existing) {
      return existing;
    }

    const newReporter: Reporter = {
      fingerprint,
      trustScore: 50,
      reportCount: 0,
      verifiedCount: 0,
      clearedCount: 0,
      abuseFlags: [],
      shadowBanned: false,
      createdAt: new Date().toISOString(),
    };

    await this.collection.insertOne(newReporter);
    return newReporter;
  }

  async findByFingerprint(fingerprint: string): Promise<Reporter | null> {
    return this.collection.findOne({ fingerprint });
  }

  async update(reporter: Reporter): Promise<void> {
    await this.collection.updateOne(
      { fingerprint: reporter.fingerprint },
      { $set: reporter }
    );
  }

  async incrementReportCount(fingerprint: string): Promise<void> {
    await this.collection.updateOne(
      { fingerprint },
      {
        $inc: { reportCount: 1 },
        $set: { lastReportTime: new Date().toISOString() },
      }
    );
  }

  async adjustTrustScore(fingerprint: string, delta: number): Promise<void> {
    const reporter = await this.findByFingerprint(fingerprint);
    if (!reporter) return;
    
    const newScore = Math.max(0, Math.min(100, reporter.trustScore + delta));
    await this.collection.updateOne(
      { fingerprint },
      { $set: { trustScore: newScore } }
    );
  }

  async addAbuseFlag(fingerprint: string, flag: string): Promise<void> {
    await this.collection.updateOne(
      { fingerprint },
      { $addToSet: { abuseFlags: flag } }
    );
  }

  async setShadowBanned(fingerprint: string, banned: boolean): Promise<void> {
    await this.collection.updateOne(
      { fingerprint },
      { $set: { shadowBanned: banned } }
    );
  }

  async findAll(limit: number = 100): Promise<Reporter[]> {
    return this.collection
      .find({})
      .sort({ trustScore: -1 })
      .limit(limit)
      .toArray();
  }
}


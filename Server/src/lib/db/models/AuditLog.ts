import { Collection, Db } from 'mongodb';

export enum AuditAction {
  REPORT_CREATED = 'REPORT_CREATED',
  VERDICT_CHANGED = 'VERDICT_CHANGED',
  REPORTER_BANNED = 'REPORTER_BANNED',
  CASE_VIEWED = 'CASE_VIEWED',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_LOGOUT = 'ADMIN_LOGOUT',
  STATE_TRANSITION = 'STATE_TRANSITION',
}

export interface AuditLog {
  action: AuditAction;
  actor: string;
  target?: string;
  beforeState?: string;
  afterState?: string;
  timestamp: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export class AuditLogModel {
  private collection: Collection<AuditLog>;

  constructor(db: Db) {
    this.collection = db.collection<AuditLog>('audit_logs');
    this.ensureIndexes();
  }

  private async ensureIndexes() {
    await this.collection.createIndex({ timestamp: -1 });
    await this.collection.createIndex({ actor: 1 });
    await this.collection.createIndex({ target: 1 });
    await this.collection.createIndex({ action: 1 });
  }

  async log(log: AuditLog): Promise<void> {
    await this.collection.insertOne(log);
  }

  async findByTarget(target: string, limit: number = 100): Promise<AuditLog[]> {
    return this.collection
      .find({ target })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  async findByActor(actor: string, limit: number = 100): Promise<AuditLog[]> {
    return this.collection
      .find({ actor })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  async findAll(limit: number = 1000): Promise<AuditLog[]> {
    return this.collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }
}


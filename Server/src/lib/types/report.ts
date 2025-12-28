export enum ReportStatus {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  WEIGHTED = 'WEIGHTED',
}

export enum ScamCategory {
  TRADE_SCAM = 'TRADE_SCAM',
  FAKE_MIDDLEMAN = 'FAKE_MIDDLEMAN',
  ACCOUNT_SCAM = 'ACCOUNT_SCAM',
  COIN_SCAM = 'COIN_SCAM',
  OTHER = 'OTHER',
}

export interface Report {
  reportId: string;
  targetUuid: string;
  targetUsername: string;
  reporterFingerprint: string;
  category: ScamCategory;
  description: string;
  proofLinks: string[];
  proofHashes: string[];
  timestamp: string;
  status: ReportStatus;
  weight?: number;
  metadata: {
    ip?: string;
    userAgent?: string;
    [key: string]: any;
  };
}


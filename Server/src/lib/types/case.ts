export enum Verdict {
  CLEAN = 'CLEAN',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  DISPUTED = 'DISPUTED',
  CLEARED = 'CLEARED',
}

export interface StateTransition {
  from: Verdict;
  to: Verdict;
  timestamp: string;
  reason?: string;
  actor?: string;
}

export interface Case {
  targetUuid: string;
  verdict: Verdict;
  confidence: number;
  reports: string[];
  timeline: StateTransition[];
  proofOverlap: Record<string, number>;
  reporterDiversity: string[];
  patternMatches: string[];
  lastUpdated: string;
  createdAt: string;
}


import { Reporter } from '@/lib/db/models/Reporter';

export function getTrustWeight(reporter: Reporter): number {
  if (reporter.shadowBanned) {
    return 0;
  }

  const baseScore = reporter.trustScore;
  const verifiedRatio = reporter.reportCount > 0 
    ? reporter.verifiedCount / reporter.reportCount 
    : 0;
  const clearedRatio = reporter.reportCount > 0 
    ? reporter.clearedCount / reporter.reportCount 
    : 0;

  let weight = baseScore * 0.5;

  if (verifiedRatio > 0.5) {
    weight += 20;
  } else if (verifiedRatio > 0.3) {
    weight += 10;
  }

  if (clearedRatio > 0.3) {
    weight -= 15;
  }

  return Math.max(0, Math.min(50, weight));
}


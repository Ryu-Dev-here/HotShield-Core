import React from 'react';
import { Reporter } from '@/lib/db/models/Reporter';

interface ReporterMetricsProps {
  reporter: Reporter;
}

export function ReporterMetrics({ reporter }: ReporterMetricsProps) {
  const verifiedRatio = reporter.reportCount > 0 
    ? ((reporter.verifiedCount / reporter.reportCount) * 100).toFixed(1)
    : '0';
  const clearedRatio = reporter.reportCount > 0
    ? ((reporter.clearedCount / reporter.reportCount) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-midnight-100">Reporter Metrics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-midnight-800 rounded border border-midnight-700">
          <p className="text-sm text-midnight-300">Trust Score</p>
          <p className="text-2xl font-bold text-midnight-100">{reporter.trustScore}/100</p>
        </div>
        <div className="p-3 bg-midnight-800 rounded border border-midnight-700">
          <p className="text-sm text-midnight-300">Total Reports</p>
          <p className="text-2xl font-bold text-midnight-100">{reporter.reportCount}</p>
        </div>
        <div className="p-3 bg-midnight-800 rounded border border-midnight-700">
          <p className="text-sm text-midnight-300">Verified</p>
          <p className="text-2xl font-bold text-green-400">{reporter.verifiedCount}</p>
          <p className="text-xs text-midnight-400">{verifiedRatio}%</p>
        </div>
        <div className="p-3 bg-midnight-800 rounded border border-midnight-700">
          <p className="text-sm text-midnight-300">Cleared</p>
          <p className="text-2xl font-bold text-red-400">{reporter.clearedCount}</p>
          <p className="text-xs text-midnight-400">{clearedRatio}%</p>
        </div>
      </div>
      {reporter.shadowBanned && (
        <div className="p-3 bg-red-900 border border-red-700 rounded">
          <p className="text-sm font-medium text-red-200">Shadow Banned</p>
        </div>
      )}
      {reporter.abuseFlags.length > 0 && (
        <div className="p-3 bg-yellow-900 border border-yellow-700 rounded">
          <p className="text-sm font-medium text-yellow-200">Abuse Flags</p>
          <ul className="text-xs text-yellow-300 mt-1 list-disc list-inside">
            {reporter.abuseFlags.map((flag, i) => (
              <li key={i}>{flag}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


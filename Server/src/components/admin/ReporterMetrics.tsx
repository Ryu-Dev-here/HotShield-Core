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
      <h3 className="text-lg font-semibold">Reporter Metrics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Trust Score</p>
          <p className="text-2xl font-bold">{reporter.trustScore}/100</p>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Total Reports</p>
          <p className="text-2xl font-bold">{reporter.reportCount}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Verified</p>
          <p className="text-2xl font-bold text-green-600">{reporter.verifiedCount}</p>
          <p className="text-xs text-gray-500">{verifiedRatio}%</p>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Cleared</p>
          <p className="text-2xl font-bold text-red-600">{reporter.clearedCount}</p>
          <p className="text-xs text-gray-500">{clearedRatio}%</p>
        </div>
      </div>
      {reporter.shadowBanned && (
        <div className="p-3 bg-red-100 border border-red-300 rounded">
          <p className="text-sm font-medium text-red-800">Shadow Banned</p>
        </div>
      )}
      {reporter.abuseFlags.length > 0 && (
        <div className="p-3 bg-yellow-100 border border-yellow-300 rounded">
          <p className="text-sm font-medium text-yellow-800">Abuse Flags</p>
          <ul className="text-xs text-yellow-700 mt-1 list-disc list-inside">
            {reporter.abuseFlags.map((flag, i) => (
              <li key={i}>{flag}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


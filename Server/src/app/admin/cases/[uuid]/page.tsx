'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from 'src/components/admin/navbar';
import { CaseTimeline } from 'src/components/admin/casetimeline';
import { ProofViewer } from 'src/components/admin/proofviewer';
import { ReporterMetrics } from 'src/components/admin/reportermetrics';
import { VerdictControls } from 'src/components/admin/verdictcontrols';
import { Verdict } from 'src/lib/types/case';
import Link from 'next/link';
import { Button } from 'src/components/ui/button';

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [reporters, setReporters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.uuid) return;

    fetch(`/api/admin/cases/${params.uuid}`)
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setCaseData(data.case);
          setReports(data.reports);
          setReporters(data.reporters);
        }
        setLoading(false);
      });
  }, [params.uuid, router]);

  const handleVerdictChange = async (verdict: Verdict, reason?: string) => {
    const response = await fetch(`/api/admin/cases/${params.uuid}/verdict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verdict, reason }),
    });

    if (!response.ok) {
      throw new Error('Failed to update verdict');
    }

    if (caseData) {
      setCaseData({ ...caseData, verdict });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-950">
        <Navbar />
        <div className="p-8 text-midnight-100">Loading...</div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-midnight-950">
        <Navbar />
        <div className="p-8 text-midnight-100">Case not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Link href="/admin/cases">
            <Button variant="secondary" className="text-sm">
              ← Back to Cases
            </Button>
          </Link>
        </div>
        <div className="bg-midnight-900 rounded-lg shadow-lg border border-midnight-800 p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-midnight-100">Case Details</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-midnight-300">UUID</p>
              <p className="font-mono text-sm text-midnight-100">{caseData.targetUuid}</p>
            </div>
            <div>
              <p className="text-sm text-midnight-300">Verdict</p>
              <p className="font-semibold text-midnight-100">{caseData.verdict}</p>
            </div>
            <div>
              <p className="text-sm text-midnight-300">Confidence</p>
              <p className="font-semibold text-midnight-100">{caseData.confidence}%</p>
            </div>
            <div>
              <p className="text-sm text-midnight-300">Reports</p>
              <p className="font-semibold text-midnight-100">{caseData.reports.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-midnight-900 rounded-lg shadow-lg border border-midnight-800 p-6">
            <CaseTimeline timeline={caseData.timeline} />
          </div>
          <div className="bg-midnight-900 rounded-lg shadow-lg border border-midnight-800 p-6">
            <VerdictControls
              currentVerdict={caseData.verdict}
              onVerdictChange={handleVerdictChange}
            />
          </div>
        </div>

        <div className="mt-6 bg-midnight-900 rounded-lg shadow-lg border border-midnight-800 p-6">
          <h3 className="text-lg font-semibold mb-4 text-midnight-100">Reports</h3>
          <div className="space-y-4">
            {reports.map((report, i) => {
              const reporter = reporters.find((r) => r.fingerprint === report.reporterFingerprint);
              return (
                <div key={i} className="border border-midnight-800 rounded p-4 bg-midnight-800">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-midnight-100">{report.category}</span>
                    <span className="text-sm text-midnight-400">
                      {new Date(report.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-midnight-200 mb-2">{report.description}</p>
                  <ProofViewer
                    proofLinks={report.proofLinks}
                    proofHashes={report.proofHashes}
                  />
                  {reporter && (
                    <div className="mt-2">
                      <ReporterMetrics reporter={reporter} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}


'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/admin/navbar';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export default function CasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/cases')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setCases(data);
        }
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-950">
        <Navbar />
        <div className="p-8 text-midnight-100">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-6 text-midnight-100">Cases</h2>
        <Table headers={['UUID', 'Verdict', 'Confidence', 'Reports', 'Last Updated', 'Actions']}>
          {cases.map((caseData) => (
            <tr key={caseData.targetUuid}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-midnight-200">
                {caseData.targetUuid.substring(0, 8)}...
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded ${
                  caseData.verdict === 'VERIFIED' ? 'bg-red-900 text-red-200' :
                  caseData.verdict === 'PENDING' ? 'bg-yellow-900 text-yellow-200' :
                  caseData.verdict === 'DISPUTED' ? 'bg-orange-900 text-orange-200' :
                  'bg-midnight-800 text-midnight-200'
                }`}>
                  {caseData.verdict}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-midnight-200">{caseData.confidence}%</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-midnight-200">{caseData.reports.length}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-midnight-300">
                {new Date(caseData.lastUpdated).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Link href={`/admin/cases/${caseData.targetUuid}`}>
                  <Button variant="secondary" className="text-xs">View</Button>
                </Link>
              </td>
            </tr>
          ))}
        </Table>
      </main>
    </div>
  );
}


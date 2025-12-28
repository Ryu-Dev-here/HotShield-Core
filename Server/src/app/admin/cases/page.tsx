'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';

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
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold">HotShield Admin</h1>
            <div className="flex space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="secondary">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Cases</h2>
        <Table headers={['UUID', 'Verdict', 'Confidence', 'Reports', 'Last Updated', 'Actions']}>
          {cases.map((caseData) => (
            <tr key={caseData.targetUuid}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                {caseData.targetUuid.substring(0, 8)}...
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded ${
                  caseData.verdict === 'VERIFIED' ? 'bg-red-100 text-red-800' :
                  caseData.verdict === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  caseData.verdict === 'DISPUTED' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {caseData.verdict}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{caseData.confidence}%</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{caseData.reports.length}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
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


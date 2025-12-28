'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/admin/Navbar';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';

export default function ReportersPage() {
  const [reporters, setReporters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high-trust' | 'low-trust' | 'abuse-flagged'>('all');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/reporters')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setReporters(data);
        }
        setLoading(false);
      });
  }, [router]);

  const filteredReporters = reporters.filter((r) => {
    if (filter === 'high-trust') return r.trustScore >= 70;
    if (filter === 'low-trust') return r.trustScore < 30;
    if (filter === 'abuse-flagged') return r.abuseFlags.length > 0;
    return true;
  });

  const handleShadowBan = async (fingerprint: string, shadowBanned: boolean) => {
    const response = await fetch(`/api/admin/reporters/${fingerprint}/ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shadowBanned: !shadowBanned }),
    });

    if (response.ok) {
      setReporters((prev) =>
        prev.map((r) =>
          r.fingerprint === fingerprint ? { ...r, shadowBanned: !shadowBanned } : r
        )
      );
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

  return (
    <div className="min-h-screen bg-midnight-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-midnight-100">Reporters</h2>
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'secondary'}
              onClick={() => setFilter('all')}
              className="text-sm"
            >
              All
            </Button>
            <Button
              variant={filter === 'high-trust' ? 'primary' : 'secondary'}
              onClick={() => setFilter('high-trust')}
              className="text-sm"
            >
              High Trust
            </Button>
            <Button
              variant={filter === 'low-trust' ? 'primary' : 'secondary'}
              onClick={() => setFilter('low-trust')}
              className="text-sm"
            >
              Low Trust
            </Button>
            <Button
              variant={filter === 'abuse-flagged' ? 'primary' : 'secondary'}
              onClick={() => setFilter('abuse-flagged')}
              className="text-sm"
            >
              Abuse Flagged
            </Button>
          </div>
        </div>
        <Table
          headers={[
            'Fingerprint',
            'Trust Score',
            'Reports',
            'Accuracy',
            'Abuse Flags',
            'Shadow Banned',
            'Actions',
          ]}
        >
          {filteredReporters.map((reporter) => {
            const accuracy =
              reporter.reportCount > 0
                ? Math.round(
                    ((reporter.reportCount - reporter.abuseFlags.length) / reporter.reportCount) *
                      100
                  )
                : 0;
            return (
              <tr key={reporter.fingerprint}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-midnight-200">
                  {reporter.fingerprint.substring(0, 12)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      reporter.trustScore >= 70
                        ? 'bg-green-900 text-green-200'
                        : reporter.trustScore >= 30
                        ? 'bg-yellow-900 text-yellow-200'
                        : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {reporter.trustScore}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-midnight-200">{reporter.reportCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-midnight-200">{accuracy}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {reporter.abuseFlags.length > 0 ? (
                    <span className="text-red-400 font-semibold">
                      {reporter.abuseFlags.length}
                    </span>
                  ) : (
                    <span className="text-midnight-400">0</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {reporter.shadowBanned ? (
                    <span className="text-red-400 font-semibold">Yes</span>
                  ) : (
                    <span className="text-midnight-400">No</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Button
                    variant={reporter.shadowBanned ? 'secondary' : 'danger'}
                    onClick={() => handleShadowBan(reporter.fingerprint, reporter.shadowBanned)}
                    className="text-xs"
                  >
                    {reporter.shadowBanned ? 'Unban' : 'Shadow Ban'}
                  </Button>
                </td>
              </tr>
            );
          })}
        </Table>
        {filteredReporters.length === 0 && (
          <div className="text-center py-8 text-midnight-400">No reporters found</div>
        )}
      </main>
    </div>
  );
}


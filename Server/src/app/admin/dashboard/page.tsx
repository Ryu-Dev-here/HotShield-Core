'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/admin/navbar';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/cases').then((res) => res.json()),
      fetch('/api/admin/reporters').then((res) => res.json()),
      fetch('/api/admin/audit?limit=10').then((res) => res.json()),
    ])
      .then(([cases, reporters, recentLogs]) => {
        const verified = cases.filter((c: any) => c.verdict === 'VERIFIED').length;
        const pending = cases.filter((c: any) => c.verdict === 'PENDING').length;
        const disputed = cases.filter((c: any) => c.verdict === 'DISPUTED').length;
        const cleared = cases.filter((c: any) => c.verdict === 'CLEARED').length;

        const highTrust = reporters.filter((r: any) => r.trustScore >= 70).length;
        const lowTrust = reporters.filter((r: any) => r.trustScore < 30).length;
        const totalReports = reporters.reduce((sum: number, r: any) => sum + r.reportCount, 0);

        setStats({
          cases: {
            total: cases.length,
            verified,
            pending,
            disputed,
            cleared,
          },
          reporters: {
            total: reporters.length,
            highTrust,
            lowTrust,
            totalReports,
          },
          recentActivity: recentLogs.slice(0, 5),
        });
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load dashboard data');
        setLoading(false);
        router.push('/admin/login');
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="p-8">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="p-8 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-midnight-100">Dashboard</h2>
          <div className="flex space-x-2">
            <Link href="/api/analyze">
              <Button variant="secondary" className="text-sm">
                Process Queue
              </Button>
            </Link>
            <Link href="/admin/cases?verdict=PENDING">
              <Button variant="secondary" className="text-sm">
                View Pending Cases
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-midnight-900 p-6 rounded-lg shadow-lg border border-midnight-800">
            <p className="text-sm text-midnight-300">Total Cases</p>
            <p className="text-3xl font-bold text-midnight-100">{stats?.cases?.total || 0}</p>
          </div>
          <div className="bg-midnight-900 p-6 rounded-lg shadow-lg border border-midnight-800">
            <p className="text-sm text-midnight-300">Verified</p>
            <p className="text-3xl font-bold text-red-400">{stats?.cases?.verified || 0}</p>
          </div>
          <div className="bg-midnight-900 p-6 rounded-lg shadow-lg border border-midnight-800">
            <p className="text-sm text-midnight-300">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">{stats?.cases?.pending || 0}</p>
          </div>
          <div className="bg-midnight-900 p-6 rounded-lg shadow-lg border border-midnight-800">
            <p className="text-sm text-midnight-300">Disputed</p>
            <p className="text-3xl font-bold text-orange-400">{stats?.cases?.disputed || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-midnight-900 p-6 rounded-lg shadow-lg border border-midnight-800">
            <h3 className="text-lg font-semibold mb-4 text-midnight-100">Reporters</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-midnight-300">Total Reporters</span>
                <span className="font-bold text-midnight-100">{stats?.reporters?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-midnight-300">High Trust (≥70)</span>
                <span className="font-bold text-green-400">{stats?.reporters?.highTrust || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-midnight-300">Low Trust (&lt;30)</span>
                <span className="font-bold text-red-400">{stats?.reporters?.lowTrust || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-midnight-300">Total Reports</span>
                <span className="font-bold text-midnight-100">{stats?.reporters?.totalReports || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-midnight-900 p-6 rounded-lg shadow-lg border border-midnight-800">
            <h3 className="text-lg font-semibold mb-4 text-midnight-100">Recent Activity</h3>
            <div className="space-y-2">
              {stats?.recentActivity?.length > 0 ? (
                stats.recentActivity.map((log: any, i: number) => (
                  <div key={i} className="text-sm border-b border-midnight-800 pb-2 last:border-0">
                    <div className="flex justify-between">
                      <span className="font-medium text-midnight-100">{log.action.replace(/_/g, ' ')}</span>
                      <span className="text-midnight-400 text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-midnight-400 mt-1">
                      {log.actor?.substring(0, 16)}...
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-midnight-400">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-midnight-900 p-6 rounded-lg shadow-lg border border-midnight-800">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/cases">
              <Button variant="secondary">View All Cases</Button>
            </Link>
            <Link href="/admin/reporters">
              <Button variant="secondary">Manage Reporters</Button>
            </Link>
            <Link href="/admin/audit">
              <Button variant="secondary">View Audit Log</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/cases')
      .then((res) => res.json())
      .then((cases) => {
        const verified = cases.filter((c: any) => c.verdict === 'VERIFIED').length;
        const pending = cases.filter((c: any) => c.verdict === 'PENDING').length;
        const disputed = cases.filter((c: any) => c.verdict === 'DISPUTED').length;
        setStats({ total: cases.length, verified, pending, disputed });
        setLoading(false);
      })
      .catch(() => {
        router.push('/admin/login');
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

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
              <Link href="/admin/cases">
                <Button variant="secondary">Cases</Button>
              </Link>
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Cases</p>
            <p className="text-3xl font-bold">{stats?.total || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Verified</p>
            <p className="text-3xl font-bold text-green-600">{stats?.verified || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats?.pending || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Disputed</p>
            <p className="text-3xl font-bold text-red-600">{stats?.disputed || 0}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

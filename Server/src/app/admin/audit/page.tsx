'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/admin/navbar';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/audit')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setLogs(data);
        }
        setLoading(false);
      });
  }, [router]);

  const filteredLogs = logs.filter((log) => {
    if (filter !== 'all' && log.action !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        log.actor?.toLowerCase().includes(term) ||
        log.target?.toLowerCase().includes(term) ||
        log.action?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const actionColors: Record<string, string> = {
    REPORT_CREATED: 'bg-blue-900 text-blue-200',
    VERDICT_CHANGED: 'bg-purple-900 text-purple-200',
    REPORTER_BANNED: 'bg-red-900 text-red-200',
    CASE_VIEWED: 'bg-midnight-800 text-midnight-200',
    ADMIN_LOGIN: 'bg-green-900 text-green-200',
    ADMIN_LOGOUT: 'bg-yellow-900 text-yellow-200',
    STATE_TRANSITION: 'bg-indigo-900 text-indigo-200',
  };

  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)));

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
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-midnight-100">Audit Log</h2>
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              placeholder="Search by actor, target, or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-midnight-700 rounded flex-1 max-w-md bg-midnight-800 text-midnight-100 placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-midnight-600"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-midnight-700 rounded bg-midnight-800 text-midnight-100 focus:outline-none focus:ring-2 focus:ring-midnight-600"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="bg-midnight-900 rounded-lg shadow-lg border border-midnight-800 overflow-hidden">
          <Table
            headers={['Timestamp', 'Action', 'Actor', 'Target', 'Before', 'After', 'IP Address']}
          >
            {filteredLogs.map((log, i) => (
              <tr key={i} className="border-b border-midnight-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-midnight-200">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      actionColors[log.action] || 'bg-midnight-800 text-midnight-200'
                    }`}
                  >
                    {log.action.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-midnight-200">
                  {log.actor?.substring(0, 16)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-midnight-200">
                  {log.target ? `${log.target.substring(0, 16)}...` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-midnight-300">
                  {log.beforeState || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-midnight-300">
                  {log.afterState || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-midnight-400">
                  {log.ipAddress || '-'}
                </td>
              </tr>
            ))}
          </Table>
          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-midnight-400">No audit logs found</div>
          )}
        </div>
      </main>
    </div>
  );
}


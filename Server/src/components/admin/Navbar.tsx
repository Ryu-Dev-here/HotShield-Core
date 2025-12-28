'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-midnight-900 shadow-lg border-b border-midnight-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/admin/dashboard" className="text-xl font-semibold text-midnight-100 hover:text-midnight-300">
            HotShield Admin
          </Link>
          <div className="flex space-x-2">
            <Link href="/admin/dashboard">
              <Button
                variant={isActive('/admin/dashboard') ? 'primary' : 'secondary'}
                className="text-sm"
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/cases">
              <Button
                variant={isActive('/admin/cases') || pathname?.startsWith('/admin/cases/') ? 'primary' : 'secondary'}
                className="text-sm"
              >
                Cases
              </Button>
            </Link>
            <Link href="/admin/reporters">
              <Button
                variant={isActive('/admin/reporters') ? 'primary' : 'secondary'}
                className="text-sm"
              >
                Reporters
              </Button>
            </Link>
            <Link href="/admin/audit">
              <Button
                variant={isActive('/admin/audit') ? 'primary' : 'secondary'}
                className="text-sm"
              >
                Audit Log
              </Button>
            </Link>
            <Button variant="secondary" onClick={handleLogout} className="text-sm">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/admin/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-midnight-950">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-midnight-100">HotShield Judgment Engine</h1>
        <p className="text-midnight-300">Redirecting to admin panel...</p>
      </div>
    </div>
  );
}


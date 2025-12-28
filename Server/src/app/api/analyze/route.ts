import { NextResponse } from 'next/server';
import { processQueuedReports } from '@/lib/layers/analysis';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ANALYZE_SECRET || 'secret'}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await processQueuedReports();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in analyze endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


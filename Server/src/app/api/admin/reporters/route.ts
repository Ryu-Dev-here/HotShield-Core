import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/layers/control';
import { getDatabase } from '@/lib/db/mongodb';
import { ReporterModel } from '@/lib/db/models/Reporter';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDatabase();
    const reporterModel = new ReporterModel(db);
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const reporters = await reporterModel.findAll(limit);
    return NextResponse.json(reporters);
  } catch (error) {
    console.error('Error fetching reporters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


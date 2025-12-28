import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { CaseModel } from '@/lib/db/models/Case';
import { caseToSnapshot, getCached, setCached } from '@/lib/layers/distribution';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const uuid = params.uuid;
    const cacheKey = `scammers:${uuid}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
          'X-Cache': 'HIT',
        },
      });
    }

    const db = await getDatabase();
    const caseModel = new CaseModel(db);

    const caseData = await caseModel.findByUuid(uuid);
    if (!caseData) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const snapshot = caseToSnapshot(caseData);
    if (!snapshot) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    setCached(cacheKey, snapshot, 300000);

    return NextResponse.json(snapshot, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error fetching scammer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


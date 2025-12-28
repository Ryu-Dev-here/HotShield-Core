import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { CaseModel } from '@/lib/db/models/Case';
import { caseToSnapshot, getCached, setCached } from '@/lib/layers/distribution';
import { Verdict } from '@/lib/types/case';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const cacheKey = 'scammers:all';
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

    const cases = await caseModel.findAllVerifiedAndPending();
    const snapshots = cases
      .map((c) => caseToSnapshot(c))
      .filter((s): s is NonNullable<typeof s> => s !== null);

    setCached(cacheKey, snapshots, 300000);

    return NextResponse.json(snapshots, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error fetching scammers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


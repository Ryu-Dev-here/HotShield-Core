import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/layers/control';
import { getDatabase } from '@/lib/db/mongodb';
import { CaseModel } from '@/lib/db/models/Case';
import { Verdict } from '@/lib/types/case';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDatabase();
    const caseModel = new CaseModel(db);
    const searchParams = request.nextUrl.searchParams;
    const verdict = searchParams.get('verdict') as Verdict | null;
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    let cases;
    if (verdict) {
      cases = await caseModel.findAllByVerdict(verdict);
    } else {
      cases = await caseModel.findAllVerifiedAndPending();
    }

    return NextResponse.json(cases.slice(0, limit));
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


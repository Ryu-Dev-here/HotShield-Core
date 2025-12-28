import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/layers/control';
import { getDatabase } from '@/lib/db/mongodb';
import { AuditLogModel } from '@/lib/db/models/AuditLog';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDatabase();
    const auditLogModel = new AuditLogModel(db);
    const searchParams = request.nextUrl.searchParams;
    const target = searchParams.get('target');
    const limit = parseInt(searchParams.get('limit') || '1000', 10);

    let logs;
    if (target) {
      logs = await auditLogModel.findByTarget(target, limit);
    } else {
      logs = await auditLogModel.findAll(limit);
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


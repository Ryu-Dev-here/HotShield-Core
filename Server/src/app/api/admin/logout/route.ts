import { NextRequest, NextResponse } from 'next/server';
import { destroySession, requireAdmin } from '@/lib/layers/control';
import { AuditLogModel, AuditAction } from '@/lib/db/models/AuditLog';
import { getDatabase } from '@/lib/db/mongodb';

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionId = request.headers.get('X-Session-Id') || 
                   request.cookies?.get('sessionId')?.value || 
                   '';

  if (sessionId) {
    await destroySession(sessionId);
  }

  const db = await getDatabase();
  const auditLogModel = new AuditLogModel(db);

  await auditLogModel.log({
    action: AuditAction.ADMIN_LOGOUT,
    actor: admin.username,
    timestamp: new Date().toISOString(),
  });

  const response = NextResponse.json({ success: true });
  response.cookies.delete('sessionId');
  return response;
}


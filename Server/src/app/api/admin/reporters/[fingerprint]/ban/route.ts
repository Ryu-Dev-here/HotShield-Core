import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/layers/control';
import { getDatabase } from '@/lib/db/mongodb';
import { ReporterModel } from '@/lib/db/models/Reporter';
import { AuditLogModel, AuditAction } from '@/lib/db/models/AuditLog';
import { z } from 'zod';

const banSchema = z.object({
  banned: z.boolean(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { fingerprint: string } }
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { banned } = banSchema.parse(body);
    const db = await getDatabase();
    const reporterModel = new ReporterModel(db);
    const auditLogModel = new AuditLogModel(db);

    await reporterModel.setShadowBanned(params.fingerprint, banned);

    await auditLogModel.log({
      action: AuditAction.REPORTER_BANNED,
      actor: admin.username,
      target: params.fingerprint,
      afterState: banned ? 'BANNED' : 'UNBANNED',
      timestamp: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    console.error('Error banning reporter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


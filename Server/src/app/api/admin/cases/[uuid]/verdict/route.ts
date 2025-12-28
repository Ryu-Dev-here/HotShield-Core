import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/layers/control';
import { getDatabase } from '@/lib/db/mongodb';
import { CaseModel } from '@/lib/db/models/Case';
import { AuditLogModel, AuditAction } from '@/lib/db/models/AuditLog';
import { Verdict } from '@/lib/types/case';
import { createStateTransition } from '@/lib/layers/analysis';
import { z } from 'zod';

const verdictSchema = z.object({
  verdict: z.enum(['CLEAN', 'PENDING', 'VERIFIED', 'DISPUTED', 'CLEARED']),
  reason: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { verdict, reason } = verdictSchema.parse(body);
    const db = await getDatabase();
    const caseModel = new CaseModel(db);
    const auditLogModel = new AuditLogModel(db);

    const caseData = await caseModel.findByUuid(params.uuid);
    if (!caseData) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const transition = createStateTransition(
      caseData.verdict,
      verdict as Verdict,
      reason || 'Manual override',
      admin.username
    );

    await caseModel.updateVerdict(params.uuid, verdict as Verdict, transition);

    await auditLogModel.log({
      action: AuditAction.VERDICT_CHANGED,
      actor: admin.username,
      target: params.uuid,
      beforeState: caseData.verdict,
      afterState: verdict,
      timestamp: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      metadata: { reason },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    console.error('Error updating verdict:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


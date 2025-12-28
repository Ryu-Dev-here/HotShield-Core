import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { ReportModel } from '@/lib/db/models/Report';
import { ReporterModel } from '@/lib/db/models/Reporter';
import { AuditLogModel, AuditAction } from '@/lib/db/models/AuditLog';
import { validateFlagRequest } from '@/lib/layers/ingestion';
import { normalizeText } from '@/lib/layers/ingestion';
import { hashProof } from '@/lib/utils/hashing';
import { detectAbuse, handleAbuse } from '@/lib/security/abuse';
import { ReportStatus, ScamCategory } from '@/lib/types/report';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('X-HotShield-Signature') || '';
    const timestamp = request.headers.get('X-HotShield-Timestamp') || '';
    const body = await request.text();
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    let parsedBody: any;
    try {
      parsedBody = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const fingerprint = parsedBody.reporterFingerprint || '';
    if (!fingerprint) {
      return NextResponse.json({ error: 'Missing reporterFingerprint' }, { status: 400 });
    }

    const validation = await validateFlagRequest(body, signature, timestamp, fingerprint, ip);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const db = await getDatabase();
    const reportModel = new ReportModel(db);
    const reporterModel = new ReporterModel(db);
    const auditLogModel = new AuditLogModel(db);

    const abusePatterns = await detectAbuse(
      fingerprint,
      (validation.validProofLinks || []).map((link) => hashProof(link)),
      timestamp,
      ip
    );

    if (abusePatterns.some((p) => p.detected)) {
      await handleAbuse(fingerprint, abusePatterns);
    }

    const reporter = await reporterModel.findOrCreate(fingerprint);
    if (reporter.shadowBanned) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const reportId = uuidv4();
    const normalizedDescription = normalizeText(validation.normalizedDescription || '');
    const proofHashes = (validation.validProofLinks || []).map((link) => hashProof(link));

    const report = {
      reportId,
      targetUuid: validation.targetUuid!,
      targetUsername: parsedBody.targetUsername || 'Unknown',
      reporterFingerprint: fingerprint,
      category: parsedBody.category as ScamCategory,
      description: normalizedDescription,
      proofLinks: validation.validProofLinks || [],
      proofHashes,
      timestamp: new Date().toISOString(),
      status: ReportStatus.QUEUED,
      metadata: {
        ip,
        userAgent: request.headers.get('user-agent'),
      },
    };

    await reportModel.create(report);
    await reporterModel.incrementReportCount(fingerprint);

    await auditLogModel.log({
      action: AuditAction.REPORT_CREATED,
      actor: fingerprint,
      target: validation.targetUuid,
      timestamp: new Date().toISOString(),
      ipAddress: ip,
      metadata: { reportId, category: parsedBody.category },
    });

    return NextResponse.json({ reportId, status: 'queued' }, { status: 201 });
  } catch (error) {
    console.error('Error processing flag request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


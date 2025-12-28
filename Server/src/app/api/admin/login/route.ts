import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, createSession } from '@/lib/layers/control';
import { AuditLogModel, AuditAction } from '@/lib/db/models/AuditLog';
import { getDatabase } from '@/lib/db/mongodb';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = loginSchema.parse(body);
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    const isValid = await verifyAdmin(username, password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const sessionId = await createSession(username, ip);
    const db = await getDatabase();
    const auditLogModel = new AuditLogModel(db);

    await auditLogModel.log({
      action: AuditAction.ADMIN_LOGIN,
      actor: username,
      timestamp: new Date().toISOString(),
      ipAddress: ip,
    });

    const response = NextResponse.json({ success: true, sessionId });
    response.cookies.set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    console.error('Error in login:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


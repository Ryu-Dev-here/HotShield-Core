import { NextResponse } from 'next/server';
import { createAdmin } from '@/lib/layers/control';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.INIT_SECRET || 'init-secret-change-me'}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    await createAdmin(username, password);
    return NextResponse.json({ success: true, message: 'Admin created' });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Admin already exists' }, { status: 409 });
    }
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


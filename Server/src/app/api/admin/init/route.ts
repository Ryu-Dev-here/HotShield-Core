import { NextResponse } from 'next/server';
import { createAdmin, adminExists } from '@/lib/layers/control';

async function initializeAdminFromEnv() {
  const envUsername = process.env.ADMIN_USERNAME;
  const envPassword = process.env.ADMIN_PASSWORD;

  if (!envUsername || !envPassword) {
    return false;
  }

  if (envPassword === 'change_me_secure_password_here' || envPassword.length < 8) {
    console.warn('ADMIN_PASSWORD is not set or too weak. Please set a secure password in .env.local');
    return false;
  }

  try {
    const exists = await adminExists(envUsername);
    if (!exists) {
      await createAdmin(envUsername, envPassword);
      console.log(`Admin user "${envUsername}" created from environment variables`);
      return true;
    }
  } catch (error: any) {
    if (error.message === 'Admin already exists') {
      return false;
    }
    console.error('Error initializing admin from env:', error);
    throw error;
  }

  return false;
}

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
    if (error.message === 'Admin already exists' || error.code === 11000) {
      return NextResponse.json({ error: 'Admin already exists' }, { status: 409 });
    }
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const created = await initializeAdminFromEnv();
    if (created) {
      return NextResponse.json({ success: true, message: 'Admin initialized from environment variables' });
    }
    return NextResponse.json({ success: false, message: 'Admin already exists or env vars not set' });
  } catch (error: any) {
    console.error('Error initializing admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


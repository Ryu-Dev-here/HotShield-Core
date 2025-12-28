import { validateSession, adminExists, createAdmin } from './auth';
import { cookies } from 'next/headers';

let adminInitChecked = false;

async function ensureAdminFromEnv() {
  if (adminInitChecked) return;
  adminInitChecked = true;

  const envUsername = process.env.ADMIN_USERNAME;
  const envPassword = process.env.ADMIN_PASSWORD;

  if (!envUsername || !envPassword) {
    return;
  }

  if (envPassword === 'change_me_secure_password_here' || envPassword.length < 8) {
    return;
  }

  try {
    const exists = await adminExists(envUsername);
    if (!exists) {
      await createAdmin(envUsername, envPassword);
      console.log(`[HotShield] Admin user "${envUsername}" auto-created from environment variables`);
    }
  } catch (error: any) {
    if (error.message !== 'Admin already exists') {
      console.error('[HotShield] Error auto-creating admin from env:', error);
    }
  }
}

export async function requireAdmin(request: Request): Promise<{ username: string } | null> {
  await ensureAdminFromEnv();

  const cookieStore = await cookies();
  const sessionId = request.headers.get('X-Session-Id') || 
                   cookieStore.get('sessionId')?.value || 
                   '';

  if (!sessionId) {
    return null;
  }

  const username = await validateSession(sessionId);
  if (!username) {
    return null;
  }

  return { username };
}

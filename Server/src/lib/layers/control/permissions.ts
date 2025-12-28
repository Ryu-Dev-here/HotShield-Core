import { validateSession } from './auth';
import { cookies } from 'next/headers';

export async function requireAdmin(request: Request): Promise<{ username: string } | null> {
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

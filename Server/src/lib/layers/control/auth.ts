import { getDatabase } from '@/lib/db/mongodb';
import { Collection } from 'mongodb';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface AdminUser {
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface Session {
  sessionId: string;
  username: string;
  expiresAt: string;
  ipAddress?: string;
}

const SESSION_DURATION = 24 * 60 * 60 * 1000;

export async function getAdminCollection(): Promise<Collection<AdminUser>> {
  const db = await getDatabase();
  return db.collection<AdminUser>('admins');
}

export async function getSessionCollection(): Promise<Collection<Session>> {
  const db = await getDatabase();
  return db.collection<Session>('sessions');
}

export async function createAdmin(username: string, password: string): Promise<void> {
  const collection = await getAdminCollection();
  const passwordHash = await bcrypt.hash(password, 10);
  
  await collection.insertOne({
    username,
    passwordHash,
    createdAt: new Date().toISOString(),
  });
}

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  const collection = await getAdminCollection();
  const admin = await collection.findOne({ username });
  
  if (!admin) {
    return false;
  }
  
  return bcrypt.compare(password, admin.passwordHash);
}

export async function createSession(username: string, ipAddress?: string): Promise<string> {
  const collection = await getSessionCollection();
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString();
  
  await collection.insertOne({
    sessionId,
    username,
    expiresAt,
    ipAddress,
  });
  
  return sessionId;
}

export async function validateSession(sessionId: string): Promise<string | null> {
  const collection = await getSessionCollection();
  const session = await collection.findOne({ sessionId });
  
  if (!session) {
    return null;
  }
  
  if (new Date(session.expiresAt) < new Date()) {
    await collection.deleteOne({ sessionId });
    return null;
  }
  
  return session.username;
}

export async function destroySession(sessionId: string): Promise<void> {
  const collection = await getSessionCollection();
  await collection.deleteOne({ sessionId });
}


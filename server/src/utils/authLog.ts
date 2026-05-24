import { randomUUID } from 'crypto';
import { query } from '../db.js';
import { UserRole } from '../types.js';

export type AuthLogType =
  | 'login'
  | 'logout'
  | 'signup'
  | 'user-created'
  | 'user-updated'
  | 'user-deleted';

export async function createAuthLog(entry: {
  type: AuthLogType;
  userId: string;
  displayName: string;
  email: string;
  role: UserRole;
  performedBy?: string | null;
  note?: string | null;
}) {
  await query(
    `INSERT INTO auth_logs
      (id, type, user_id, display_name, email, role, performed_by, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      entry.type,
      entry.userId,
      entry.displayName,
      entry.email,
      entry.role,
      entry.performedBy ?? null,
      entry.note ?? null,
    ],
  );
}

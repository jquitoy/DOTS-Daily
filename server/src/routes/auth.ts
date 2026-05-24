import { Router } from 'express';
import { randomUUID } from 'crypto';
import { query } from '../db.js';
import { comparePassword, hashPassword } from '../utils/hash.js';
import { createToken, requireAuth, AuthRequest } from '../middleware/auth.js';
import { SanitizedUser, TokenPayload, UserRole, UserRow } from '../types.js';

const router = Router();

function sanitizeUser(row: UserRow): SanitizedUser {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    middleName: row.middle_name ?? undefined,
    lastName: row.last_name,
    nameSuffix: row.name_suffix ?? undefined,
    role: row.role,
    status: row.status,
    avatarUrl: row.avatar_url ?? undefined,
    phone: row.phone ?? undefined,
    dateOfBirth: row.date_of_birth ?? undefined,
    emergencyContact: row.emergency_contact ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at ?? undefined,
  };
}

async function createAuthLog(entry: {
  type: 'login' | 'logout' | 'signup' | 'user-created' | 'user-updated' | 'user-deleted';
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

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const rows = await query<UserRow[]>('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
  const user = rows[0];

  if (!user || user.status !== 'active') {
    return res.status(401).json({ message: 'Invalid credentials or inactive user' });
  }

  const validPassword = await comparePassword(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid credentials or inactive user' });
  }

  await query('UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = ?', [user.id]);
  await createAuthLog({
    type: 'login',
    userId: user.id,
    displayName: `${user.first_name} ${user.last_name}`,
    email: user.email,
    role: user.role,
    note: 'Successful login',
  });

  const token = createToken({ userId: user.id, role: user.role, email: user.email });
  res.json({ token, user: sanitizeUser(user) });
});

router.post('/signup', async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    middleName,
    nameSuffix,
    avatarUrl,
    phone,
    dateOfBirth,
    emergencyContact,
    notes,
  } = req.body as Record<string, any>;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'Email, password, first name, and last name are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await query<UserRow[]>('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
  if (existing.length > 0) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const passwordHash = await hashPassword(password.trim());
  const userId = randomUUID();
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  await query(
    `INSERT INTO users
      (id, email, password_hash, first_name, middle_name, last_name, name_suffix, role, status, avatar_url, phone, date_of_birth, emergency_contact, notes, created_at, updated_at, last_login_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'user', 'active', ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      normalizedEmail,
      passwordHash,
      firstName.trim(),
      middleName?.trim() || null,
      lastName.trim(),
      nameSuffix?.trim() || null,
      avatarUrl?.trim() || null,
      phone?.trim() || null,
      dateOfBirth || null,
      emergencyContact?.trim() || null,
      notes?.trim() || null,
      now,
      now,
      now,
    ],
  );

  await createAuthLog({
    type: 'signup',
    userId,
    displayName: `${firstName.trim()} ${lastName.trim()}`,
    email: normalizedEmail,
    role: 'user',
    note: 'New account created through signup',
  });

  const token = createToken({ userId, role: 'user', email: normalizedEmail });
  res.status(201).json({ token, user: {
    id: userId,
    email: normalizedEmail,
    firstName: firstName.trim(),
    middleName: middleName?.trim() || undefined,
    lastName: lastName.trim(),
    nameSuffix: nameSuffix?.trim() || undefined,
    role: 'user' as UserRole,
    status: 'active' as const,
    avatarUrl: avatarUrl?.trim() || undefined,
    phone: phone?.trim() || undefined,
    dateOfBirth: dateOfBirth || undefined,
    emergencyContact: emergencyContact?.trim() || undefined,
    notes: notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  } });
});

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

router.put('/profile', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { email, firstName, lastName, middleName, nameSuffix, avatarUrl, phone, dateOfBirth, emergencyContact, notes, password } = req.body as Record<string, any>;
  const updates: any[] = [];
  const params: any[] = [];

  if (email) {
    updates.push('email = ?');
    params.push(email.trim().toLowerCase());
  }
  if (firstName) {
    updates.push('first_name = ?');
    params.push(firstName.trim());
  }
  if (middleName !== undefined) {
    updates.push('middle_name = ?');
    params.push(middleName?.trim() || null);
  }
  if (lastName) {
    updates.push('last_name = ?');
    params.push(lastName.trim());
  }
  if (nameSuffix !== undefined) {
    updates.push('name_suffix = ?');
    params.push(nameSuffix?.trim() || null);
  }
  if (avatarUrl !== undefined) {
    updates.push('avatar_url = ?');
    params.push(avatarUrl?.trim() || null);
  }
  if (phone !== undefined) {
    updates.push('phone = ?');
    params.push(phone?.trim() || null);
  }
  if (dateOfBirth !== undefined) {
    updates.push('date_of_birth = ?');
    params.push(dateOfBirth || null);
  }
  if (emergencyContact !== undefined) {
    updates.push('emergency_contact = ?');
    params.push(emergencyContact?.trim() || null);
  }
  if (notes !== undefined) {
    updates.push('notes = ?');
    params.push(notes?.trim() || null);
  }
  if (password) {
    const passwordHash = await hashPassword(password.trim());
    updates.push('password_hash = ?');
    params.push(passwordHash);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: 'No profile fields provided' });
  }

  params.push(new Date().toISOString().slice(0, 19).replace('T', ' '));
  params.push(req.user.id);

  const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`;
  await query(sql, params);

  const rows = await query<UserRow[]>('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const updated = rows[0];

  await createAuthLog({
    type: 'user-updated',
    userId: updated.id,
    displayName: `${updated.first_name} ${updated.last_name}`,
    email: updated.email,
    role: updated.role,
    performedBy: updated.email,
    note: 'Profile updated',
  });

  res.json({ user: sanitizeUser(updated) });
});

export default router;

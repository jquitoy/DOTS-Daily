import { Router } from 'express';
import { randomUUID } from 'crypto';
import { query } from '../db.js';
import { comparePassword, hashPassword } from '../utils/hash.js';
import { createAuthLog } from '../utils/authLog.js';
import { createToken, requireAuth, AuthRequest } from '../middleware/auth.js';
import { SanitizedUser, TokenPayload, UserRole, UserRow } from '../types.js';

const router = Router();

function toDateOnly(value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const isoMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})T/);
    if (isoMatch) return isoMatch[1];
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const day = String(parsed.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
  return undefined;
}

function datesMatch(left: unknown, right: unknown): boolean {
  return toDateOnly(left) === toDateOnly(right);
}

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
    dateOfBirth: toDateOnly(row.date_of_birth),
    emergencyContact: row.emergency_contact ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at ?? undefined,
  };
}

function buildProfileUpdateNote(
  before: UserRow,
  after: UserRow,
  passwordChanged: boolean,
): string {
  const changedFields: string[] = [];
  const add = (label: string, oldValue: unknown, newValue: unknown) => {
    if ((oldValue ?? null) !== (newValue ?? null)) {
      changedFields.push(label);
    }
  };

  add('email', before.email, after.email);
  add('firstName', before.first_name, after.first_name);
  add('middleName', before.middle_name, after.middle_name);
  add('lastName', before.last_name, after.last_name);
  add('nameSuffix', before.name_suffix, after.name_suffix);
  add('avatarUrl', before.avatar_url, after.avatar_url);
  add('phone', before.phone, after.phone);
  if (!datesMatch(before.date_of_birth, after.date_of_birth)) {
    changedFields.push('dateOfBirth');
  }
  add('emergencyContact', before.emergency_contact, after.emergency_contact);
  add('notes', before.notes, after.notes);

  if (passwordChanged) {
    changedFields.push('password');
  }

  if (changedFields.length === 0) {
    return 'Profile updated (no effective field changes)';
  }

  return `Profile updated. Changed: ${changedFields.join(', ')}`;
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const rows = await query<UserRow[]>('SELECT * FROM users WHERE email = ?', [
    normalizedEmail,
  ]);
  const user = rows[0];

  if (!user || user.status !== 'active') {
    return res
      .status(401)
      .json({ message: 'Invalid credentials or inactive user' });
  }

  const validPassword = await comparePassword(password, user.password_hash);
  if (!validPassword) {
    return res
      .status(401)
      .json({ message: 'Invalid credentials or inactive user' });
  }

  await query(
    'UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = ?',
    [user.id],
  );
  await createAuthLog({
    type: 'login',
    userId: user.id,
    displayName: `${user.first_name} ${user.last_name}`,
    email: user.email,
    role: user.role,
    note: 'Successful login',
  });

  const token = createToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  });
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
    return res.status(400).json({
      message: 'Email, password, first name, and last name are required',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await query<UserRow[]>(
    'SELECT id FROM users WHERE email = ?',
    [normalizedEmail],
  );
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
  res.status(201).json({
    token,
    user: {
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
    },
  });
});

router.post('/logout', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await createAuthLog({
    type: 'logout',
    userId: req.user.id,
    displayName: `${req.user.firstName} ${req.user.lastName}`,
    email: req.user.email,
    role: req.user.role,
    note: 'User logged out',
  });

  res.status(204).send();
});

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

router.put('/profile', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const {
    email,
    firstName,
    lastName,
    middleName,
    nameSuffix,
    avatarUrl,
    phone,
    dateOfBirth,
    emergencyContact,
    notes,
    password,
  } = req.body as Record<string, any>;
  const originalRows = await query<UserRow[]>(
    'SELECT * FROM users WHERE id = ?',
    [req.user.id],
  );
  const original = originalRows[0];
  if (!original) {
    return res.status(404).json({ message: 'User not found' });
  }
  const updates: any[] = [];
  const params: any[] = [];

  const normalizedEmail = email?.trim().toLowerCase();
  if (normalizedEmail && normalizedEmail !== original.email) {
    updates.push('email = ?');
    params.push(normalizedEmail);
  }
  const normalizedFirstName = firstName?.trim();
  if (normalizedFirstName && normalizedFirstName !== original.first_name) {
    updates.push('first_name = ?');
    params.push(normalizedFirstName);
  }
  const normalizedMiddleName =
    middleName !== undefined ? middleName?.trim() || null : undefined;
  if (
    normalizedMiddleName !== undefined &&
    normalizedMiddleName !== original.middle_name
  ) {
    updates.push('middle_name = ?');
    params.push(normalizedMiddleName);
  }
  const normalizedLastName = lastName?.trim();
  if (normalizedLastName && normalizedLastName !== original.last_name) {
    updates.push('last_name = ?');
    params.push(normalizedLastName);
  }
  const normalizedNameSuffix =
    nameSuffix !== undefined ? nameSuffix?.trim() || null : undefined;
  if (
    normalizedNameSuffix !== undefined &&
    normalizedNameSuffix !== original.name_suffix
  ) {
    updates.push('name_suffix = ?');
    params.push(normalizedNameSuffix);
  }
  const normalizedAvatarUrl =
    avatarUrl !== undefined ? avatarUrl?.trim() || null : undefined;
  if (
    normalizedAvatarUrl !== undefined &&
    normalizedAvatarUrl !== original.avatar_url
  ) {
    updates.push('avatar_url = ?');
    params.push(normalizedAvatarUrl);
  }
  const normalizedPhone =
    phone !== undefined ? phone?.trim() || null : undefined;
  if (normalizedPhone !== undefined && normalizedPhone !== original.phone) {
    updates.push('phone = ?');
    params.push(normalizedPhone);
  }
  const normalizedDateOfBirth =
    dateOfBirth !== undefined ? (toDateOnly(dateOfBirth) ?? null) : undefined;
  if (
    normalizedDateOfBirth !== undefined &&
    !datesMatch(normalizedDateOfBirth, original.date_of_birth)
  ) {
    updates.push('date_of_birth = ?');
    params.push(normalizedDateOfBirth);
  }
  const normalizedEmergencyContact =
    emergencyContact !== undefined
      ? emergencyContact?.trim() || null
      : undefined;
  if (
    normalizedEmergencyContact !== undefined &&
    normalizedEmergencyContact !== original.emergency_contact
  ) {
    updates.push('emergency_contact = ?');
    params.push(normalizedEmergencyContact);
  }
  const normalizedNotes =
    notes !== undefined ? notes?.trim() || null : undefined;
  if (normalizedNotes !== undefined && normalizedNotes !== original.notes) {
    updates.push('notes = ?');
    params.push(normalizedNotes);
  }
  if (password) {
    const passwordHash = await hashPassword(password.trim());
    updates.push('password_hash = ?');
    params.push(passwordHash);
  }

  if (updates.length === 0) {
    return res.json({ user: sanitizeUser(original) });
  }

  params.push(new Date().toISOString().slice(0, 19).replace('T', ' '));
  params.push(req.user.id);

  const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`;
  await query(sql, params);

  const rows = await query<UserRow[]>('SELECT * FROM users WHERE id = ?', [
    req.user.id,
  ]);
  const updated = rows[0];
  const updateNote = buildProfileUpdateNote(
    original,
    updated,
    Boolean(password),
  );

  await createAuthLog({
    type: 'user-updated',
    userId: updated.id,
    displayName: `${updated.first_name} ${updated.last_name}`,
    email: updated.email,
    role: updated.role,
    performedBy: updated.email,
    note: updateNote,
  });

  res.json({ user: sanitizeUser(updated) });
});

export default router;

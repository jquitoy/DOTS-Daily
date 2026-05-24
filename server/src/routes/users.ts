import { Router } from 'express';
import { randomUUID } from 'crypto';
import { query } from '../db.js';
import { hashPassword } from '../utils/hash.js';
import { createAuthLog } from '../utils/authLog.js';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.js';
import { SanitizedUser, UserRole, UserStatus, UserRow } from '../types.js';

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

function buildUserUpdateNote(
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
  add('role', before.role, after.role);
  add('status', before.status, after.status);
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
    return 'User updated by admin (no effective field changes)';
  }

  return `User updated by admin. Changed: ${changedFields.join(', ')}`;
}

router.use(requireAuth);

router.get('/', requireRole('admin'), async (req, res) => {
  const rows = await query<UserRow[]>(
    'SELECT * FROM users ORDER BY created_at DESC',
  );
  res.json({ users: rows.map(sanitizeUser) });
});

router.get('/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.user.role !== 'admin' && req.user.id !== id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const rows = await query<UserRow[]>('SELECT * FROM users WHERE id = ?', [id]);
  const user = rows[0];
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ user: sanitizeUser(user) });
});

router.post('/', requireRole('admin'), async (req: AuthRequest, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    middleName,
    nameSuffix,
    role,
    status,
    avatarUrl,
    phone,
    dateOfBirth,
    emergencyContact,
    notes,
  } = req.body as Record<string, any>;

  if (!email || !password || !firstName || !lastName || !role || !status) {
    return res.status(400).json({ message: 'Missing required user fields' });
  }

  if (
    !['user', 'admin'].includes(role) ||
    !['active', 'inactive'].includes(status)
  ) {
    return res.status(400).json({ message: 'Invalid role or status' });
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
      (id, email, password_hash, first_name, middle_name, last_name, name_suffix, role, status, avatar_url, phone, date_of_birth, emergency_contact, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      normalizedEmail,
      passwordHash,
      firstName.trim(),
      middleName?.trim() || null,
      lastName.trim(),
      nameSuffix?.trim() || null,
      role as UserRole,
      status as UserStatus,
      avatarUrl?.trim() || null,
      phone?.trim() || null,
      dateOfBirth || null,
      emergencyContact?.trim() || null,
      notes?.trim() || null,
      now,
      now,
    ],
  );

  await createAuthLog({
    type: 'user-created',
    userId,
    displayName: `${firstName.trim()} ${lastName.trim()}`,
    email: normalizedEmail,
    role: role as UserRole,
    performedBy: req.user?.email ?? null,
    note: `User created by admin. Initial values: role=${role}, status=${status}, email=${normalizedEmail}`,
  });

  res.status(201).json({
    user: sanitizeUser({
      id: userId,
      email: normalizedEmail,
      password_hash: passwordHash,
      first_name: firstName.trim(),
      middle_name: middleName?.trim() || null,
      last_name: lastName.trim(),
      name_suffix: nameSuffix?.trim() || null,
      role: role as UserRole,
      status: status as UserStatus,
      avatar_url: avatarUrl?.trim() || null,
      phone: phone?.trim() || null,
      date_of_birth: dateOfBirth || null,
      emergency_contact: emergencyContact?.trim() || null,
      notes: notes?.trim() || null,
      created_at: now,
      updated_at: now,
      last_login_at: null,
    }),
  });
});

router.put('/:id', requireRole('admin'), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const {
    email,
    firstName,
    lastName,
    middleName,
    nameSuffix,
    role,
    status,
    avatarUrl,
    phone,
    dateOfBirth,
    emergencyContact,
    notes,
    password,
  } = req.body as Record<string, any>;

  const rows = await query<UserRow[]>('SELECT * FROM users WHERE id = ?', [id]);
  const user = rows[0];
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const updates: string[] = [];
  const params: any[] = [];

  const normalizedEmail = email?.trim().toLowerCase();
  if (normalizedEmail && normalizedEmail !== user.email) {
    updates.push('email = ?');
    params.push(normalizedEmail);
  }
  const normalizedFirstName = firstName?.trim();
  if (normalizedFirstName && normalizedFirstName !== user.first_name) {
    updates.push('first_name = ?');
    params.push(normalizedFirstName);
  }
  const normalizedMiddleName =
    middleName !== undefined ? middleName?.trim() || null : undefined;
  if (
    normalizedMiddleName !== undefined &&
    normalizedMiddleName !== user.middle_name
  ) {
    updates.push('middle_name = ?');
    params.push(normalizedMiddleName);
  }
  const normalizedLastName = lastName?.trim();
  if (normalizedLastName && normalizedLastName !== user.last_name) {
    updates.push('last_name = ?');
    params.push(normalizedLastName);
  }
  const normalizedNameSuffix =
    nameSuffix !== undefined ? nameSuffix?.trim() || null : undefined;
  if (
    normalizedNameSuffix !== undefined &&
    normalizedNameSuffix !== user.name_suffix
  ) {
    updates.push('name_suffix = ?');
    params.push(normalizedNameSuffix);
  }
  if (role && role !== user.role) {
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    updates.push('role = ?');
    params.push(role);
  }
  if (status && status !== user.status) {
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    updates.push('status = ?');
    params.push(status);
  }
  const normalizedAvatarUrl =
    avatarUrl !== undefined ? avatarUrl?.trim() || null : undefined;
  if (
    normalizedAvatarUrl !== undefined &&
    normalizedAvatarUrl !== user.avatar_url
  ) {
    updates.push('avatar_url = ?');
    params.push(normalizedAvatarUrl);
  }
  const normalizedPhone =
    phone !== undefined ? phone?.trim() || null : undefined;
  if (normalizedPhone !== undefined && normalizedPhone !== user.phone) {
    updates.push('phone = ?');
    params.push(normalizedPhone);
  }
  const normalizedDateOfBirth =
    dateOfBirth !== undefined ? (toDateOnly(dateOfBirth) ?? null) : undefined;
  if (
    normalizedDateOfBirth !== undefined &&
    !datesMatch(normalizedDateOfBirth, user.date_of_birth)
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
    normalizedEmergencyContact !== user.emergency_contact
  ) {
    updates.push('emergency_contact = ?');
    params.push(normalizedEmergencyContact);
  }
  const normalizedNotes =
    notes !== undefined ? notes?.trim() || null : undefined;
  if (normalizedNotes !== undefined && normalizedNotes !== user.notes) {
    updates.push('notes = ?');
    params.push(normalizedNotes);
  }
  if (password) {
    const passwordHash = await hashPassword(password.trim());
    updates.push('password_hash = ?');
    params.push(passwordHash);
  }

  if (updates.length === 0) {
    return res.json({ user: sanitizeUser(user) });
  }

  params.push(new Date().toISOString().slice(0, 19).replace('T', ' '));
  params.push(id);

  const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`;
  await query(sql, params);

  const updatedRows = await query<UserRow[]>(
    'SELECT * FROM users WHERE id = ?',
    [id],
  );
  const updated = updatedRows[0];
  const updateNote = buildUserUpdateNote(user, updated, Boolean(password));

  await createAuthLog({
    type: 'user-updated',
    userId: updated.id,
    displayName: `${updated.first_name} ${updated.last_name}`,
    email: updated.email,
    role: updated.role,
    performedBy: req.user?.email ?? null,
    note: updateNote,
  });

  res.json({ user: sanitizeUser(updated) });
});

router.delete('/:id', requireRole('admin'), async (req: AuthRequest, res) => {
  const { id } = req.params;
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (req.user.id === id) {
    return res.status(400).json({ message: 'Admin cannot delete themselves' });
  }

  const rows = await query<UserRow[]>('SELECT * FROM users WHERE id = ?', [id]);
  if (rows.length === 0) {
    return res.status(404).json({ message: 'User not found' });
  }

  const deletedUser = rows[0];
  await query('DELETE FROM users WHERE id = ?', [id]);

  await createAuthLog({
    type: 'user-deleted',
    userId: deletedUser.id,
    displayName: `${deletedUser.first_name} ${deletedUser.last_name}`,
    email: deletedUser.email,
    role: deletedUser.role,
    performedBy: req.user.email,
    note: `User deleted by admin. Final values: role=${deletedUser.role}, status=${deletedUser.status}, email=${deletedUser.email}`,
  });

  res.status(204).send();
});

export default router;

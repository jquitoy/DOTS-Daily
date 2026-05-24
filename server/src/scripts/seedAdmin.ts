import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { query } from '../db.js';
import { hashPassword } from '../utils/hash.js';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@doti.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123';

async function run() {
  console.log('Connecting to database to seed admin user...');

  const admins = await query('SELECT id, email FROM users WHERE role = ? LIMIT 1', ['admin']);
  if (admins && (admins as any).length > 0) {
    console.log('Admin user already exists:', (admins as any)[0].email);
    process.exit(0);
  }

  const id = randomUUID();
  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  await query(
    `INSERT INTO users (id, email, password_hash, first_name, last_name, role, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'admin', 'active', ?, ?)`,
    [id, ADMIN_EMAIL, passwordHash, 'Admin', 'User', now, now],
  );

  await query(
    `INSERT INTO auth_logs (id, type, user_id, display_name, email, role, performed_by, note)
     VALUES (?, 'user-created', ?, ?, ?, 'admin', ?, ?)`,
    [randomUUID(), id, 'Admin User', ADMIN_EMAIL, 'system', 'Seeded initial admin user'],
  );

  console.log('Seeded admin user:', ADMIN_EMAIL);
  console.log('Please change the password immediately in production.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Failed to seed admin:', err);
  process.exit(1);
});

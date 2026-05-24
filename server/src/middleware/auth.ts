import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { SanitizedUser, TokenPayload, UserRow, UserRole } from '../types.js';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment');
}
const JWT_SECRET = process.env.JWT_SECRET as jwt.Secret;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment');
}

export interface AuthRequest extends Request {
  user?: SanitizedUser;
  tokenPayload?: TokenPayload;
}

function sanitizeUser(user: UserRow): SanitizedUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    middleName: user.middle_name ?? undefined,
    lastName: user.last_name,
    nameSuffix: user.name_suffix ?? undefined,
    role: user.role,
    status: user.status,
    avatarUrl: user.avatar_url ?? undefined,
    phone: user.phone ?? undefined,
    dateOfBirth: user.date_of_birth ?? undefined,
    emergencyContact: user.emergency_contact ?? undefined,
    notes: user.notes ?? undefined,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    lastLoginAt: user.last_login_at ?? undefined,
  };
}

export function createToken(payload: TokenPayload) {
  return (jwt as any).sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '12h',
  });
}

export function verifyToken(token: string): TokenPayload {
  return (jwt as any).verify(token, JWT_SECRET) as TokenPayload;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing authorization header' });
  }

  const token = authHeader.slice(7);
  let payload: TokenPayload;
  try {
    payload = verifyToken(token);
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const rows = await query<UserRow[]>('SELECT * FROM users WHERE id = ? AND status = ?', [payload.userId, 'active']);
  const user = rows[0];
  if (!user) {
    return res.status(401).json({ message: 'User not found or inactive' });
  }

  req.user = sanitizeUser(user);
  req.tokenPayload = payload;
  next();
}

export function requireRole(requiredRole: UserRole) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
}

export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'inactive';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  name_suffix: string | null;
  role: UserRole;
  status: UserStatus;
  avatar_url: string | null;
  phone: string | null;
  date_of_birth: string | null;
  emergency_contact: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface SanitizedUser {
  id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  nameSuffix?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface AuthLogRow {
  id: string;
  type: 'login' | 'logout' | 'signup' | 'user-created' | 'user-updated' | 'user-deleted';
  user_id: string;
  display_name: string;
  email: string;
  role: UserRole;
  performed_by: string | null;
  note: string | null;
  created_at: string;
}

export interface TokenPayload {
  userId: string;
  role: UserRole;
  email: string;
}

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  formatPersonName,
  isPersonNameValid,
  normalizePersonNameInput,
  PersonName,
  PersonNameInput,
  resolvePersonName,
} from '../lib/personName';
import {
  setToken,
  getToken,
  loginApi,
  signupApi,
  meApi,
  logoutApi,
  getUsersApi,
  getAuthLogsApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  updateProfileApi,
} from '../lib/api';

type UserRole = 'user' | 'admin';
type UserStatus = 'active' | 'inactive';

export interface User extends PersonName {
  id: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
}

export interface AdminUser extends User {
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  notes?: string;
}

export interface AuthLog {
  id: string;
  type:
    | 'login'
    | 'logout'
    | 'signup'
    | 'user-created'
    | 'user-updated'
    | 'user-deleted';
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  timestamp: string;
  performedBy?: string;
  note?: string;
}

type StoredUser = AdminUser & { password: string };

type CreateUserInput = PersonNameInput & {
  email: string;
  password: string;
  role: UserRole;
  status?: UserStatus;
  phone?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  notes?: string;
};

type UpdateUserInput = Partial<
  Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>
> & {
  password?: string;
};

function mapPersonNameToApiPayload(name: PersonNameInput) {
  return {
    firstName: name.firstName,
    middleName: name.middleName,
    lastName: name.lastName,
    nameSuffix: name.suffix,
  };
}

interface AuthContextType {
  user: User | null;
  users: AdminUser[];
  authLogs: AuthLog[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    email: string,
    password: string,
    name: PersonNameInput,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  createUser: (input: CreateUserInput) => boolean;
  updateUser: (id: string, updates: UpdateUserInput) => boolean;
  deleteUser: (id: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_STORAGE_KEY = 'doti_user';

// Backend-driven auth: users and logs are fetched from API when authenticated.

function generateId() {
  return (
    globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 11)
  );
}

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeDateOnly(value: unknown): string | undefined {
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

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const isoMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})T/);
    if (isoMatch) {
      return isoMatch[1];
    }

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

function normalizeUser(
  user: Partial<StoredUser> & {
    email: string;
    role: UserRole;
    password: string;
  } & PersonNameInput,
): StoredUser {
  const now = new Date().toISOString();
  const resolvedName = resolvePersonName(user);
  const normalizedName = normalizePersonNameInput({
    firstName: resolvedName.firstName,
    middleName: resolvedName.middleName,
    lastName: resolvedName.lastName,
    suffix: resolvedName.suffix,
  });

  return {
    id: user.id ?? generateId(),
    email: user.email,
    firstName: normalizedName.firstName,
    middleName: normalizedName.middleName || undefined,
    lastName: normalizedName.lastName,
    suffix: normalizedName.suffix || undefined,
    role: user.role,
    status: user.status ?? 'active',
    avatar: user.avatar,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    emergencyContact: user.emergencyContact,
    notes: user.notes,
    password: user.password,
    createdAt: user.createdAt ?? now,
    updatedAt: user.updatedAt ?? now,
    lastLoginAt: user.lastLoginAt,
  };
}

function stripPassword(user: StoredUser): AdminUser {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

function normalizeAuthLog(raw: any): AuthLog {
  return {
    id: raw.id,
    type: raw.type,
    userId: raw.user_id ?? raw.userId,
    name: raw.display_name ?? raw.name ?? '',
    email: raw.email ?? '',
    role: raw.role ?? 'user',
    timestamp:
      raw.created_at && typeof raw.created_at === 'string'
        ? new Date(raw.created_at).toISOString()
        : (raw.timestamp ?? new Date().toISOString()),
    performedBy: raw.performed_by ?? raw.performedBy ?? undefined,
    note: raw.note ?? undefined,
  };
}

function seedOrStoredLogs(): AuthLog[] {
  const stored = safeJsonParse<AuthLog[] | null>(
    localStorage.getItem(SESSION_STORAGE_KEY),
    null,
  );
  return [];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [storedUsers, setStoredUsers] = useState<StoredUser[]>([]);
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const users = storedUsers.map(stripPassword);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    (async () => {
      try {
        const resp = await meApi();
        setUser(resp.user as User);
      } catch {
        setToken(null);
        setUser(null);
      }
    })();
  }, []);

  useEffect(() => {
    if (user?.role !== 'admin') {
      setStoredUsers([]);
      setAuthLogs([]);
      return;
    }

    (async () => {
      try {
        const usersResp = await getUsersApi();
        const mappedUsers = (usersResp.users || []).map((u: any) => ({
          id: u.id,
          email: u.email,
          firstName: u.firstName || u.first_name || '',
          middleName: u.middleName || u.middle_name || undefined,
          lastName: u.lastName || u.last_name || '',
          suffix: u.nameSuffix || u.suffix || undefined,
          role: u.role || 'user',
          status: u.status || 'active',
          avatarUrl: u.avatarUrl || u.avatar_url || undefined,
          avatar: u.avatar || undefined,
          phone: u.phone || undefined,
          dateOfBirth: normalizeDateOnly(u.dateOfBirth ?? u.date_of_birth),
          emergencyContact:
            u.emergencyContact || u.emergency_contact || undefined,
          notes: u.notes || undefined,
          createdAt: u.createdAt || u.created_at || new Date().toISOString(),
          updatedAt: u.updatedAt || u.updated_at || new Date().toISOString(),
          lastLoginAt: u.lastLoginAt || u.last_login_at || undefined,
        })) as StoredUser[];
        setStoredUsers(mappedUsers);

        const logsResp = await getAuthLogsApi();
        setAuthLogs((logsResp.authLogs || []).map(normalizeAuthLog));
      } catch (err) {
        console.error('Failed to load admin data:', err);
      }
    })();
  }, [user?.role]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [user]);

  const appendLog = (entry: Omit<AuthLog, 'id' | 'timestamp'>) => {
    const timestamp = new Date().toISOString();
    setAuthLogs((currentLogs) =>
      [
        {
          ...entry,
          id: generateId(),
          timestamp,
        },
        ...currentLogs,
      ].slice(0, 60),
    );
  };

  const updateStoredUser = (targetId: string, updates: Partial<StoredUser>) => {
    setStoredUsers((currentUsers) =>
      currentUsers.map((candidate) =>
        candidate.id === targetId
          ? normalizeUser({
              ...candidate,
              ...updates,
              updatedAt: new Date().toISOString(),
            })
          : candidate,
      ),
    );
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const resp = await loginApi(email.trim().toLowerCase(), password);
      const { token, user: respUser } = resp;
      setToken(token);
      setUser(respUser);

      if (respUser.role === 'admin') {
        const usersResp = await getUsersApi();
        setStoredUsers(usersResp.users || []);
        const logsResp = await getAuthLogsApi();
        setAuthLogs((logsResp.authLogs || []).map(normalizeAuthLog));
      }

      return true;
    } catch (err) {
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: PersonNameInput,
  ): Promise<boolean> => {
    try {
      const payload = {
        email: email.trim().toLowerCase(),
        password,
        ...mapPersonNameToApiPayload(name),
      };
      const resp = await signupApi(payload);
      setToken(resp.token);
      setUser(resp.user);
      return true;
    } catch (err) {
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // ignore logout errors and clear client session anyway
    }

    if (user) {
      appendLog({
        type: 'logout',
        userId: user.id,
        name: formatPersonName(user),
        email: user.email,
        role: user.role,
        note: 'User logged out',
      });
    }

    setUser(null);
    setToken(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    (async () => {
      try {
        const resp = await updateProfileApi(updates);
        setUser(resp.user);
      } catch (err) {
        // ignore
      }
    })();
  };

  const createUser = (input: CreateUserInput): boolean => {
    if (!user || user.role !== 'admin') return false;
    (async () => {
      try {
        const payload = {
          ...input,
          ...mapPersonNameToApiPayload(input),
        };
        await createUserApi(payload);
        const usersResp = await getUsersApi();
        setStoredUsers(usersResp.users || []);
      } catch (err) {
        // ignore
      }
    })();
    return true;
  };

  const updateUser = (id: string, updates: UpdateUserInput): boolean => {
    if (!user || user.role !== 'admin') return false;
    (async () => {
      try {
        const { suffix, password, ...rest } = updates;
        const payload = {
          ...rest,
          nameSuffix: suffix,
          ...(password?.trim() ? { password } : {}),
        };
        await updateUserApi(id, payload);
        const usersResp = await getUsersApi();
        setStoredUsers(usersResp.users || []);
      } catch (err) {
        // ignore
      }
    })();
    return true;
  };

  const deleteUser = (id: string): boolean => {
    if (!user || user.role !== 'admin') return false;
    if (user.id === id) return false;
    (async () => {
      try {
        await deleteUserApi(id);
        const usersResp = await getUsersApi();
        setStoredUsers(usersResp.users || []);
      } catch (err) {
        // ignore
      }
    })();
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        authLogs,
        login,
        signup,
        logout,
        updateProfile,
        createUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

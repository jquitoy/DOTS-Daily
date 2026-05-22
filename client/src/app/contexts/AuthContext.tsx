import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type UserRole = 'user' | 'admin';
type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  email: string;
  name: string;
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

type CreateUserInput = {
  name: string;
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

interface AuthContextType {
  user: User | null;
  users: AdminUser[];
  authLogs: AuthLog[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  createUser: (input: CreateUserInput) => boolean;
  updateUser: (id: string, updates: UpdateUserInput) => boolean;
  deleteUser: (id: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_STORAGE_KEY = 'doti_users';
const SESSION_STORAGE_KEY = 'doti_user';
const LOG_STORAGE_KEY = 'doti_auth_logs';

const seedUsers: StoredUser[] = [
  {
    id: '1',
    email: 'user@doti.com',
    name: 'Jane Smith',
    role: 'user',
    status: 'active',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    emergencyContact: '+1 (555) 987-6543',
    password: 'password123',
    createdAt: '2026-01-01T09:00:00.000Z',
    updatedAt: '2026-01-15T10:00:00.000Z',
    lastLoginAt: '2026-01-15T08:00:00.000Z',
    notes: 'Weekly progress reviews',
  },
  {
    id: '2',
    email: 'admin@doti.com',
    name: 'Admin User',
    role: 'admin',
    status: 'active',
    password: 'admin123',
    createdAt: '2026-01-01T09:00:00.000Z',
    updatedAt: '2026-01-15T10:00:00.000Z',
    lastLoginAt: '2026-01-15T08:30:00.000Z',
    notes: 'Primary portal administrator',
  },
  {
    id: '3',
    email: 'mary.j@email.com',
    name: 'Mary Johnson',
    role: 'user',
    status: 'active',
    phone: '+1 (555) 123-4568',
    password: 'mary123',
    createdAt: '2026-01-03T09:15:00.000Z',
    updatedAt: '2026-01-15T11:00:00.000Z',
    lastLoginAt: '2026-01-15T07:30:00.000Z',
  },
  {
    id: '4',
    email: 'inactive.patient@email.com',
    name: 'Robert Brown',
    role: 'user',
    status: 'inactive',
    phone: '+1 (555) 123-4569',
    password: 'robert123',
    createdAt: '2026-01-04T10:00:00.000Z',
    updatedAt: '2026-01-14T08:45:00.000Z',
    lastLoginAt: '2026-01-12T10:00:00.000Z',
    notes: 'Temporarily suspended while records are reviewed',
  },
];

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

function normalizeUser(
  user: Partial<StoredUser> & {
    email: string;
    name: string;
    role: UserRole;
    password: string;
  },
): StoredUser {
  const now = new Date().toISOString();

  return {
    id: user.id ?? generateId(),
    email: user.email,
    name: user.name,
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

function seedOrStoredUsers(): StoredUser[] {
  const stored = safeJsonParse<StoredUser[] | null>(
    localStorage.getItem(USER_STORAGE_KEY),
    null,
  );
  if (Array.isArray(stored) && stored.length > 0) {
    return stored.map((user) => normalizeUser(user));
  }

  return seedUsers;
}

function seedOrStoredLogs(): AuthLog[] {
  const stored = safeJsonParse<AuthLog[] | null>(
    localStorage.getItem(LOG_STORAGE_KEY),
    null,
  );
  if (Array.isArray(stored)) {
    return stored;
  }

  return [];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [storedUsers, setStoredUsers] =
    useState<StoredUser[]>(seedOrStoredUsers);
  const [authLogs, setAuthLogs] = useState<AuthLog[]>(seedOrStoredLogs);
  const [user, setUser] = useState<User | null>(null);

  const users = storedUsers.map(stripPassword);

  useEffect(() => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(storedUsers));
  }, [storedUsers]);

  useEffect(() => {
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(authLogs));
  }, [authLogs]);

  useEffect(() => {
    const storedSession = safeJsonParse<User | null>(
      localStorage.getItem(SESSION_STORAGE_KEY),
      null,
    );

    if (!storedSession) {
      return;
    }

    const existingUser = storedUsers.find(
      (candidate) =>
        candidate.id === storedSession.id ||
        candidate.email === storedSession.email,
    );

    if (existingUser && existingUser.status === 'active') {
      setUser(stripPassword(existingUser));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [storedUsers]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const currentRecord = storedUsers.find(
      (candidate) => candidate.id === user.id,
    );
    if (!currentRecord) {
      setUser(null);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }

    const updatedSession = stripPassword(currentRecord);
    if (JSON.stringify(updatedSession) !== JSON.stringify(user)) {
      setUser(updatedSession);
    }
  }, [storedUsers, user]);

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
    await new Promise((resolve) => setTimeout(resolve, 400));

    const normalizedEmail = email.trim().toLowerCase();
    const matchedUser = storedUsers.find(
      (candidate) => candidate.email.toLowerCase() === normalizedEmail,
    );

    if (
      !matchedUser ||
      matchedUser.password !== password ||
      matchedUser.status !== 'active'
    ) {
      return false;
    }

    const now = new Date().toISOString();
    const updatedUser: StoredUser = {
      ...matchedUser,
      lastLoginAt: now,
      updatedAt: now,
    };

    setStoredUsers((currentUsers) =>
      currentUsers.map((candidate) =>
        candidate.id === matchedUser.id ? updatedUser : candidate,
      ),
    );
    setUser(stripPassword(updatedUser));
    appendLog({
      type: 'login',
      userId: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
      note: 'Successful login',
    });

    return true;
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
  ): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const normalizedEmail = email.trim().toLowerCase();
    if (
      storedUsers.some(
        (candidate) => candidate.email.toLowerCase() === normalizedEmail,
      )
    ) {
      return false;
    }

    const now = new Date().toISOString();
    const newStoredUser = normalizeUser({
      id: generateId(),
      email: normalizedEmail,
      name: name.trim(),
      role: 'user',
      status: 'active',
      password,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    });

    setStoredUsers((currentUsers) => [...currentUsers, newStoredUser]);
    setUser(stripPassword(newStoredUser));
    appendLog({
      type: 'signup',
      userId: newStoredUser.id,
      name: newStoredUser.name,
      email: newStoredUser.email,
      role: newStoredUser.role,
      note: 'New account created through signup',
    });

    return true;
  };

  const logout = () => {
    if (user) {
      appendLog({
        type: 'logout',
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        note: 'User logged out',
      });
    }

    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) {
      return;
    }

    const existingRecord = storedUsers.find(
      (candidate) => candidate.id === user.id,
    );
    if (!existingRecord) {
      return;
    }

    const nextEmail =
      updates.email?.trim().toLowerCase() ?? existingRecord.email;
    const duplicateEmail = storedUsers.some(
      (candidate) =>
        candidate.id !== existingRecord.id &&
        candidate.email.toLowerCase() === nextEmail,
    );

    if (duplicateEmail) {
      return;
    }

    const now = new Date().toISOString();
    const updatedRecord = normalizeUser({
      ...existingRecord,
      ...updates,
      email: nextEmail,
      updatedAt: now,
      password: existingRecord.password,
    });

    setStoredUsers((currentUsers) =>
      currentUsers.map((candidate) =>
        candidate.id === existingRecord.id ? updatedRecord : candidate,
      ),
    );
    setUser(stripPassword(updatedRecord));
  };

  const createUser = (input: CreateUserInput): boolean => {
    if (!user || user.role !== 'admin') {
      return false;
    }

    const normalizedEmail = input.email.trim().toLowerCase();
    if (!normalizedEmail || !input.name.trim() || !input.password.trim()) {
      return false;
    }

    if (
      storedUsers.some(
        (candidate) => candidate.email.toLowerCase() === normalizedEmail,
      )
    ) {
      return false;
    }

    const now = new Date().toISOString();
    const newUser = normalizeUser({
      id: generateId(),
      email: normalizedEmail,
      name: input.name.trim(),
      role: input.role,
      status: input.status ?? 'active',
      phone: input.phone?.trim() || undefined,
      dateOfBirth: input.dateOfBirth?.trim() || undefined,
      emergencyContact: input.emergencyContact?.trim() || undefined,
      notes: input.notes?.trim() || undefined,
      password: input.password,
      createdAt: now,
      updatedAt: now,
    });

    setStoredUsers((currentUsers) => [...currentUsers, newUser]);
    appendLog({
      type: 'user-created',
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      performedBy: user.email,
      note: `Created by ${user.name}`,
    });

    return true;
  };

  const updateUser = (id: string, updates: UpdateUserInput): boolean => {
    if (!user || user.role !== 'admin') {
      return false;
    }

    const currentRecord = storedUsers.find((candidate) => candidate.id === id);
    if (!currentRecord) {
      return false;
    }

    const nextEmail =
      updates.email?.trim().toLowerCase() ?? currentRecord.email;
    const duplicateEmail = storedUsers.some(
      (candidate) =>
        candidate.id !== id && candidate.email.toLowerCase() === nextEmail,
    );

    if (duplicateEmail) {
      return false;
    }

    const now = new Date().toISOString();
    const updatedRecord = normalizeUser({
      ...currentRecord,
      ...updates,
      email: nextEmail,
      password: updates.password?.trim()
        ? updates.password
        : currentRecord.password,
      updatedAt: now,
    });

    setStoredUsers((currentUsers) =>
      currentUsers.map((candidate) =>
        candidate.id === id ? updatedRecord : candidate,
      ),
    );

    if (user.id === id) {
      setUser(stripPassword(updatedRecord));
    }

    appendLog({
      type: 'user-updated',
      userId: updatedRecord.id,
      name: updatedRecord.name,
      email: updatedRecord.email,
      role: updatedRecord.role,
      performedBy: user.email,
      note: `Updated by ${user.name}`,
    });

    return true;
  };

  const deleteUser = (id: string): boolean => {
    if (!user || user.role !== 'admin') {
      return false;
    }

    const currentRecord = storedUsers.find((candidate) => candidate.id === id);
    if (!currentRecord || currentRecord.id === user.id) {
      return false;
    }

    setStoredUsers((currentUsers) =>
      currentUsers.filter((candidate) => candidate.id !== id),
    );
    appendLog({
      type: 'user-deleted',
      userId: currentRecord.id,
      name: currentRecord.name,
      email: currentRecord.email,
      role: currentRecord.role,
      performedBy: user.email,
      note: `Deleted by ${user.name}`,
    });

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

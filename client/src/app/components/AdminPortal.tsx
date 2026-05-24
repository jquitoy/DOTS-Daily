import { useState, type FormEvent } from 'react';
import { AdminUser, AuthLog, useAuth } from '../contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { LogoutConfirmDialog } from './LogoutConfirmDialog';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Activity,
  AlertCircle,
  BadgeCheck,
  Ban,
  CalendarClock,
  Clock3,
  Eye,
  History,
  LogOut,
  PencilLine,
  Search,
  Shield,
  Trash2,
  UserCog,
  UserPlus,
  UserRound,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { PersonNameFields } from './PersonNameFields';
import {
  emptyPersonName,
  formatPersonName,
  isPersonNameValid,
  normalizePersonNameInput,
  PersonNameInput,
} from '../lib/personName';

type TabKey = 'overview' | 'users' | 'logs';
type FormMode = 'create' | 'edit' | 'view';

type UserFormState = {
  personName: PersonNameInput;
  email: string;
  password: string;
  role: AdminUser['role'];
  status: AdminUser['status'];
  phone: string;
  dateOfBirth: string;
  emergencyContact: string;
  notes: string;
};

const emptyForm = (): UserFormState => ({
  personName: emptyPersonName(),
  email: '',
  password: '',
  role: 'user',
  status: 'active',
  phone: '',
  dateOfBirth: '',
  emergencyContact: '',
  notes: '',
});

const formatDateTime = (value?: string) =>
  value
    ? new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'Never';

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
        new Date(value),
      )
    : 'Not provided';

function roleBadgeClass(role: AdminUser['role']) {
  return role === 'admin'
    ? 'bg-primary/10 text-primary border-primary/20'
    : 'bg-cyan-50 text-cyan-700 border-cyan-200';
}

function statusBadgeClass(status: AdminUser['status']) {
  return status === 'active'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-amber-50 text-amber-700 border-amber-200';
}

function logBadgeClass(type: AuthLog['type']) {
  if (type === 'logout') return 'bg-slate-100 text-slate-700 border-slate-200';
  if (type === 'login')
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (type === 'signup') return 'bg-cyan-50 text-cyan-700 border-cyan-200';
  return 'bg-primary/10 text-primary border-primary/20';
}

function prettifyLogType(type: AuthLog['type']) {
  switch (type) {
    case 'login':
      return 'Login';
    case 'logout':
      return 'Logout';
    case 'signup':
      return 'Signup';
    case 'user-created':
      return 'User created';
    case 'user-updated':
      return 'User updated';
    case 'user-deleted':
      return 'User deleted';
    default:
      return type;
  }
}

export function AdminPortal() {
  const { user, users, authLogs, logout, createUser, updateUser, deleteUser } =
    useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [formState, setFormState] = useState<UserFormState>(emptyForm());

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
        <Card className="w-full max-w-xl border-primary/20 shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-cyan-500 to-teal-400" />
          <CardHeader className="text-center pt-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Shield className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">Admin access required</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              User management, role changes, and login/logout audit logs are
              available only to administrators.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const filteredUsers = users.filter((candidate) => {
    const query = searchQuery.toLowerCase();
    const displayName = formatPersonName(candidate).toLowerCase();
    return (
      displayName.includes(query) ||
      (candidate.firstName ?? '').toLowerCase().includes(query) ||
      (candidate.middleName ?? '').toLowerCase().includes(query) ||
      (candidate.lastName ?? '').toLowerCase().includes(query) ||
      (candidate.suffix ?? '').toLowerCase().includes(query) ||
      (candidate.email ?? '').toLowerCase().includes(query) ||
      (candidate.role ?? '').toLowerCase().includes(query) ||
      (candidate.status ?? '').toLowerCase().includes(query)
    );
  });

  const filteredLogs = authLogs.filter((entry) => {
    const query = searchQuery.toLowerCase();
    return (
      (entry.name ?? '').toLowerCase().includes(query) ||
      (entry.email ?? '').toLowerCase().includes(query) ||
      (entry.type ?? '').toLowerCase().includes(query) ||
      (entry.performedBy ?? '').toLowerCase().includes(query)
    );
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const stats = {
    totalUsers: users.length,
    admins: users.filter((candidate) => candidate.role === 'admin').length,
    activeUsers: users.filter((candidate) => candidate.status === 'active')
      .length,
    inactiveUsers: users.filter((candidate) => candidate.status === 'inactive')
      .length,
    loginsToday: authLogs.filter(
      (entry) =>
        entry.type === 'login' && new Date(entry.timestamp) >= todayStart,
    ).length,
    auditEvents: authLogs.length,
  };

  const openCreateDialog = () => {
    setSelectedUser(null);
    setFormMode('create');
    setFormState(emptyForm());
    setIsFormOpen(true);
  };

  const openEditDialog = (candidate: AdminUser) => {
    setSelectedUser(candidate);
    setFormMode('edit');
    setFormState({
      personName: {
        firstName: candidate.firstName,
        middleName: candidate.middleName ?? '',
        lastName: candidate.lastName,
        suffix: candidate.suffix ?? '',
      },
      email: candidate.email,
      password: '',
      role: candidate.role,
      status: candidate.status,
      phone: candidate.phone ?? '',
      dateOfBirth: candidate.dateOfBirth ?? '',
      emergencyContact: candidate.emergencyContact ?? '',
      notes: candidate.notes ?? '',
    });
    setIsFormOpen(true);
  };

  const openViewDialog = (candidate: AdminUser) => {
    setSelectedUser(candidate);
    setFormMode('view');
    setFormState({
      personName: {
        firstName: candidate.firstName,
        middleName: candidate.middleName ?? '',
        lastName: candidate.lastName,
        suffix: candidate.suffix ?? '',
      },
      email: candidate.email,
      password: '',
      role: candidate.role,
      status: candidate.status,
      phone: candidate.phone ?? '',
      dateOfBirth: candidate.dateOfBirth ?? '',
      emergencyContact: candidate.emergencyContact ?? '',
      notes: candidate.notes ?? '',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (formMode === 'view') {
      setIsFormOpen(false);
      return;
    }

    if (!isPersonNameValid(formState.personName) || !formState.email.trim()) {
      toast.error('First name, last name, and email are required.');
      return;
    }

    const normalizedName = normalizePersonNameInput(formState.personName);

    if (formMode === 'create' && !formState.password.trim()) {
      toast.error('Password is required for new users.');
      return;
    }

    if (formMode === 'create') {
      const success = createUser({
        ...normalizedName,
        email: formState.email.trim(),
        password: formState.password,
        role: formState.role,
        status: formState.status,
        phone: formState.phone.trim() || undefined,
        dateOfBirth: formState.dateOfBirth || undefined,
        emergencyContact: formState.emergencyContact.trim() || undefined,
        notes: formState.notes.trim() || undefined,
      });

      if (!success) {
        toast.error(
          'Could not create that user. Check for duplicate email or missing values.',
        );
        return;
      }

      toast.success('User created successfully.');
      setIsFormOpen(false);
      setFormState(emptyForm());
      return;
    }

    if (!selectedUser) {
      return;
    }

    const success = updateUser(selectedUser.id, {
      ...normalizedName,
      middleName: normalizedName.middleName || undefined,
      suffix: normalizedName.suffix || undefined,
      email: formState.email.trim(),
      password: formState.password.trim() || undefined,
      role: formState.role,
      status: formState.status,
      phone: formState.phone.trim() || undefined,
      dateOfBirth: formState.dateOfBirth || undefined,
      emergencyContact: formState.emergencyContact.trim() || undefined,
      notes: formState.notes.trim() || undefined,
    });

    if (!success) {
      toast.error(
        'Could not update that user. The email may already be in use.',
      );
      return;
    }

    toast.success('User updated successfully.');
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) {
      return;
    }

    if (deleteTarget.id === user.id) {
      toast.error('You cannot delete the account you are currently using.');
      setIsDeleteOpen(false);
      return;
    }

    const success = deleteUser(deleteTarget.id);
    if (!success) {
      toast.error('Could not delete that user.');
      return;
    }

    toast.success('User deleted successfully.');
    setDeleteTarget(null);
    setIsDeleteOpen(false);
  };

  const recentLogs = authLogs.slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative bg-gradient-to-br from-primary via-cyan-500 to-teal-400 px-6 py-6 shadow-lg overflow-hidden">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                DOTS Daily Admin
              </h1>
              <p className="text-sm text-white/80">
                User management, roles, and audit logs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm sm:block">
              Logged in as{' '}
              <span className="font-semibold">{formatPersonName(user)}</span>
            </div>
            <LogoutConfirmDialog
              onConfirm={logout}
              buttonVariant="secondary"
              buttonClassName="border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
            />
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6">
          <div className="flex gap-2 py-3">
            {[
              { key: 'overview' as const, label: 'Overview', icon: Activity },
              { key: 'users' as const, label: 'Users', icon: Users },
              { key: 'logs' as const, label: 'Audit Logs', icon: History },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-primary bg-primary text-white shadow-sm'
                      : 'border-transparent bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="w-full pb-4 sm:w-80 sm:py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search users or logs..."
                className="bg-white pl-10 shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[
                {
                  label: 'Total users',
                  value: stats.totalUsers,
                  icon: Users,
                  description: 'All accounts in the system',
                },
                {
                  label: 'Administrators',
                  value: stats.admins,
                  icon: Shield,
                  description: 'Users with admin privileges',
                },
                {
                  label: 'Active users',
                  value: stats.activeUsers,
                  icon: BadgeCheck,
                  description: 'Can sign in right now',
                },
                {
                  label: 'Login events today',
                  value: stats.loginsToday,
                  icon: Clock3,
                  description: 'Recorded in the audit log',
                },
                {
                  label: 'Inactive accounts',
                  value: stats.inactiveUsers,
                  icon: Ban,
                  description: 'Currently blocked from login',
                },
                {
                  label: 'Audit events',
                  value: stats.auditEvents,
                  icon: Activity,
                  description: 'Login, logout, and CRUD history',
                },
              ].map((stat) => {
                const Icon = stat.icon;

                return (
                  <Card
                    key={stat.label}
                    className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="mb-1 text-sm text-muted-foreground">
                            {stat.label}
                          </p>
                          <p className="text-3xl font-bold">{stat.value}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {stat.description}
                          </p>
                        </div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                          <Icon className="h-7 w-7 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-5 w-5 text-primary" />
                    Recent admin actions
                  </CardTitle>
                  <CardDescription>
                    Latest logins, logouts, and user management events
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentLogs.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                      No audit events yet.
                    </div>
                  ) : (
                    recentLogs.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 rounded-lg border p-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <History className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{entry.name}</p>
                            <Badge className={logBadgeClass(entry.type)}>
                              {prettifyLogType(entry.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {entry.email} • {entry.role}{' '}
                            {entry.performedBy
                              ? `• by ${entry.performedBy}`
                              : ''}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatDateTime(entry.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Security reminders
                  </CardTitle>
                  <CardDescription>
                    Frontend enforcement points for the system rules
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <div className="rounded-lg border bg-muted/30 p-4">
                    Only admins can create, edit, view, and delete accounts from
                    this portal.
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    Inactive users are blocked from logging in until an admin
                    re-enables the account.
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    Every sign-in and sign-out is written to the audit log for
                    review.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>User directory</CardTitle>
                  <CardDescription>
                    Manage admin and user roles with modal-based create, edit,
                    view, and delete actions.
                  </CardDescription>
                </div>
                <Button
                  onClick={openCreateDialog}
                  className="self-start bg-primary hover:bg-primary/90"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add user
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-xl border">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last login</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-10 text-center text-muted-foreground"
                          >
                            No users match your search.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((candidate) => (
                          <TableRow key={candidate.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                  <UserRound className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {formatPersonName(candidate)}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {candidate.email}
                                  </p>
                                  {candidate.phone && (
                                    <p className="text-xs text-muted-foreground">
                                      {candidate.phone}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={roleBadgeClass(candidate.role)}>
                                {candidate.role === 'admin' ? 'Admin' : 'User'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={statusBadgeClass(candidate.status)}
                              >
                                {candidate.status === 'active'
                                  ? 'Active'
                                  : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDateTime(candidate.lastLoginAt)}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openViewDialog(candidate)}
                                >
                                  <Eye className="mr-1 h-4 w-4" />
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditDialog(candidate)}
                                >
                                  <PencilLine className="mr-1 h-4 w-4" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setDeleteTarget(candidate);
                                    setIsDeleteOpen(true);
                                  }}
                                  disabled={candidate.id === user.id}
                                >
                                  <Trash2 className="mr-1 h-4 w-4" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Login and logout logs</CardTitle>
                <CardDescription>
                  Audit trail for account activity and user management changes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredLogs.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    No log entries match your search.
                  </div>
                ) : (
                  filteredLogs.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Clock3 className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{entry.name}</p>
                            <Badge className={logBadgeClass(entry.type)}>
                              {prettifyLogType(entry.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {entry.email} • {entry.role}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.performedBy
                              ? `Performed by ${entry.performedBy}`
                              : 'Self-service event'}{' '}
                            • {formatDateTime(entry.timestamp)}
                          </p>
                          {entry.note && (
                            <p className="mt-1 text-sm text-foreground/80">
                              {entry.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setSelectedUser(null);
            setFormState(emptyForm());
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'create' && 'Add user'}
              {formMode === 'edit' && 'Edit user'}
              {formMode === 'view' && 'View user'}
            </DialogTitle>
            <DialogDescription>
              {formMode === 'create' &&
                'Create a new account and assign a role.'}
              {formMode === 'edit' &&
                'Update the account details, role, or status.'}
              {formMode === 'view' &&
                'Read-only account details and profile metadata.'}
            </DialogDescription>
          </DialogHeader>

          {formMode === 'view' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="md:col-span-2 border-primary/20 bg-primary/5">
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                    <UserRound className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold">
                      {formatPersonName(formState.personName)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formState.email}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Role
                </p>
                <p className="mt-1 font-medium">
                  {formState.role === 'admin' ? 'Admin' : 'User'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Status
                </p>
                <p className="mt-1 font-medium">
                  {formState.status === 'active' ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Phone
                </p>
                <p className="mt-1 font-medium">
                  {formState.phone || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Date of birth
                </p>
                <p className="mt-1 font-medium">
                  {formState.dateOfBirth
                    ? formatDate(formState.dateOfBirth)
                    : 'Not provided'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Emergency contact
                </p>
                <p className="mt-1 font-medium">
                  {formState.emergencyContact || 'Not provided'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Notes
                </p>
                <p className="mt-1 rounded-lg border bg-muted/20 p-3 text-sm text-foreground/80">
                  {formState.notes || 'No notes recorded.'}
                </p>
              </div>
            </div>
          ) : (
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Legal name
                </label>
                <PersonNameFields
                  idPrefix="admin-user"
                  value={formState.personName}
                  onChange={(personName) =>
                    setFormState((current) => ({
                      ...current,
                      personName,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {formMode === 'create'
                    ? 'Password'
                    : 'New password (optional)'}
                </label>
                <Input
                  type="password"
                  value={formState.password}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Role</label>
                <Select
                  value={formState.role}
                  onValueChange={(value) =>
                    setFormState((current) => ({
                      ...current,
                      role: value as AdminUser['role'],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Status</label>
                <Select
                  value={formState.status}
                  onValueChange={(value) =>
                    setFormState((current) => ({
                      ...current,
                      status: value as AdminUser['status'],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Phone</label>
                <Input
                  value={formState.phone}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Date of birth
                </label>
                <Input
                  type="date"
                  value={formState.dateOfBirth}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      dateOfBirth: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Emergency contact
                </label>
                <Input
                  value={formState.emergencyContact}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      emergencyContact: event.target.value,
                    }))
                  }
                  placeholder="Emergency contact number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Notes</label>
                <Textarea
                  value={formState.notes}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Optional notes for the care team or admin team."
                  rows={4}
                />
              </div>

              <DialogFooter className="md:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                >
                  {formMode === 'create' ? 'Create user' : 'Save changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This will permanently remove ${formatPersonName(deleteTarget)} (${deleteTarget.email}) from the user directory.`
                : 'This will permanently remove the selected user from the directory.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

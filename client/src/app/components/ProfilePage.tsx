import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { User, Mail, Phone, Calendar, Shield, LogOut, Eye, EyeOff, Copy, Check, Laptop, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { LogoutConfirmDialog } from './LogoutConfirmDialog';
import { PersonNameFields } from './PersonNameFields';
import { getToken } from '../lib/api';
import {
  emptyPersonName,
  formatPersonName,
  isPersonNameValid,
  normalizePersonNameInput,
  personNameInitials,
} from '../lib/personName';

interface ProfilePageProps {
  onViewChange?: (view: string) => void;
}

export function ProfilePage({ onViewChange }: ProfilePageProps) {
  const { user, updateProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    personName: user
      ? {
          firstName: user.firstName,
          middleName: user.middleName ?? '',
          lastName: user.lastName,
          suffix: user.suffix ?? '',
        }
      : emptyPersonName(),
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    emergencyContact: user?.emergencyContact || '',
  });

  const token = getToken() || '';

  const handleCopyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    toast.success('Sync token copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPersonNameValid(formData.personName)) {
      toast.error('First name and last name are required');
      return;
    }

    const normalizedName = normalizePersonNameInput(formData.personName);
    updateProfile({
      ...normalizedName,
      middleName: normalizedName.middleName || undefined,
      suffix: normalizedName.suffix || undefined,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      emergencyContact: formData.emergencyContact,
    });
    setEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleCancel = () => {
    setFormData({
      personName: user
        ? {
            firstName: user.firstName,
            middleName: user.middleName ?? '',
            lastName: user.lastName,
            suffix: user.suffix ?? '',
          }
        : emptyPersonName(),
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      emergencyContact: user?.emergencyContact || '',
    });
    setEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1>My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarFallback className="text-2xl">
                  {user ? personNameInitials(user) : '?'}
                </AvatarFallback>
              </Avatar>
              <h3 className="mb-1">
                {user ? formatPersonName(user) : 'Unknown user'}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {user?.email}
              </p>
              {user?.role === 'admin' && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                  <Shield className="w-3 h-3" />
                  Administrator
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details here</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>
                    <User className="w-4 h-4 inline mr-1" />
                    Legal name
                  </Label>
                  <PersonNameFields
                    idPrefix="profile"
                    value={formData.personName}
                    onChange={(personName) =>
                      setFormData({ ...formData, personName })
                    }
                    disabled={!editing}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={user?.email}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="emergencyContact">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Emergency Contact
                  </Label>
                  <Input
                    id="emergencyContact"
                    type="tel"
                    value={formData.emergencyContact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContact: e.target.value,
                      })
                    }
                    disabled={!editing}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                {!editing ? (
                  <Button type="button" onClick={() => setEditing(true)}>
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button type="submit">Save Changes</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Admin Portal Access */}
      {user?.role === 'admin' && onViewChange && (
        <Card className="mt-6 border-primary/20 bg-gradient-to-br from-primary/5 to-cyan-50">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle>Administrator Access</CardTitle>
                <CardDescription className="mt-1">
                  Access the admin portal to view and manage all TB DOTS
                  patients
                </CardDescription>
                <Button onClick={() => onViewChange('admin')} className="mt-4">
                  <Shield className="w-4 h-4 mr-2" />
                  Open Admin Portal
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Session Sync Token Card */}
      <Card className="mt-6 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 shadow-md overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary via-cyan-500 to-teal-400" />
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary group-hover:scale-110 transition-transform duration-300">
              <Laptop className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl flex items-center gap-2">
                Session Sync Token
                <span className="inline-flex items-center rounded-full bg-teal-100 dark:bg-teal-900/50 px-2.5 py-0.5 text-xs font-semibold text-teal-800 dark:text-teal-400">
                  Active
                </span>
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Continue where you left off on another browser or device instantly. Copy this secure sync token and paste it on the login page of your other browser.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Warning Alert */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-amber-800 dark:text-amber-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
            <div className="leading-relaxed">
              <strong className="font-semibold">Security Warning:</strong> Keep this token private. Anyone with access to this token can access your account directly without entering a password. It is only valid for the duration of this session (up to 12 hours).
            </div>
          </div>

          {/* Token Display Container */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Input
                type={showToken ? 'text' : 'password'}
                value={token}
                readOnly
                className="font-mono text-sm bg-muted/30 border-muted-foreground/15 pr-10 select-all select-none"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted cursor-pointer"
                title={showToken ? 'Hide token' : 'Show token'}
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="button"
              onClick={handleCopyToken}
              className="bg-primary hover:bg-primary/90 text-white font-medium shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              disabled={!token}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Sync Token
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logout Button */}
      <LogoutConfirmDialog
        onConfirm={handleLogout}
        buttonVariant="outline"
        buttonClassName="mt-6"
      />
    </div>
  );
}

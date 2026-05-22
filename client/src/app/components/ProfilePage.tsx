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
import { User, Mail, Phone, Calendar, Shield, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface ProfilePageProps {
  onViewChange?: (view: string) => void;
}

export function ProfilePage({ onViewChange }: ProfilePageProps) {
  const { user, updateProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    emergencyContact: user?.emergencyContact || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      emergencyContact: user?.emergencyContact || '',
    });
    setEditing(false);
  };

  const handleLogout = () => {
    logout();
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
                  {user?.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="mb-1">{user?.name}</h3>
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
                <div className="space-y-2">
                  <Label htmlFor="name">
                    <User className="w-4 h-4 inline mr-1" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!editing}
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

      {/* Logout Button */}
      <Button
        type="button"
        variant="outline"
        className="mt-6"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}

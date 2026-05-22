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
import { AlertCircle, Pill, Shield } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { PersonNameFields } from './PersonNameFields';
import {
  emptyPersonName,
  isPersonNameValid,
  normalizePersonNameInput,
} from '../lib/personName';

interface SignupPageProps {
  onSwitchToLogin: () => void;
}

export function SignupPage({ onSwitchToLogin }: SignupPageProps) {
  const { signup } = useAuth();
  const [personName, setPersonName] = useState(emptyPersonName());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!isPersonNameValid(personName)) {
      setError('First name and last name are required');
      return;
    }

    setLoading(true);
    const success = await signup(
      email,
      password,
      normalizePersonNameInput(personName),
    );

    if (!success) {
      setError('Email already registered');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-primary/10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden bg-gradient-to-br from-primary via-cyan-500 to-teal-400 p-8 text-white sm:p-10">
            <div className="absolute top-8 right-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-4 left-4 h-36 w-36 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 flex h-full flex-col justify-between gap-8">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] backdrop-blur-sm">
                <Shield className="h-4 w-4" />
                Secure account creation
              </div>

              <div className="space-y-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
                  <Pill className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    Join DOTS Daily
                  </h1>
                  <p className="mt-3 max-w-md text-sm leading-6 text-white/85 sm:text-base">
                    Create a treatment account to track medication dates,
                    reminders, and progress.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 text-sm text-white/90 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  Log doses, view history, and follow your medication schedule.
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  Your account starts as a user role by default.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card p-8 sm:p-10">
            <Card className="border-0 shadow-none">
              <CardHeader className="space-y-4 px-0 pt-0">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
                    <Pill className="w-7 h-7" />
                  </div>
                </div>
                <CardTitle className="text-center text-2xl">
                  Create your account
                </CardTitle>
                <CardDescription className="text-center">
                  Join DOTS Daily for your TB treatment journey.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <PersonNameFields
                    idPrefix="signup"
                    value={personName}
                    onChange={setPersonName}
                    required
                  />

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={onSwitchToLogin}
                      className="text-primary hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

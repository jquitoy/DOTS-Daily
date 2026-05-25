import { useState, type FormEvent } from 'react';
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
import { AlertCircle, Pill, Shield, KeyRound, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface LoginPageProps {
  onSwitchToSignup: () => void;
}

export function LoginPage({ onSwitchToSignup }: LoginPageProps) {
  const { login, loginWithToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'credentials' | 'token'>(
    'credentials',
  );
  const [syncToken, setSyncToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let success = false;
    if (loginMethod === 'credentials') {
      success = await login(email, password);
      if (!success) {
        setError('Invalid email or password');
      }
    } else {
      if (!syncToken.trim()) {
        setError('Please enter a session sync token');
        setLoading(false);
        return;
      }
      success = await loginWithToken(syncToken.trim());
      if (!success) {
        setError('Invalid, expired, or malformed session sync token');
      }
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
                Secure patient portal
              </div>

              <div className="space-y-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
                  <Pill className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    DOTS Daily
                  </h1>
                  <p className="mt-3 max-w-md text-sm leading-6 text-white/85 sm:text-base">
                    Track medication intake, review dose history, and stay
                    aligned with your TB treatment plan.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 text-sm text-white/90 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  Logged doses and date history are available after sign in.
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  Admin accounts open the protected management portal.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card p-8 sm:p-10">
            <Card className="border-0 shadow-none">
              <CardHeader className="space-y-4 px-0 pt-0">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10 animate-pulse">
                    <Pill className="w-7 h-7" />
                  </div>
                </div>
                <CardTitle className="text-center text-2xl">
                  {loginMethod === 'credentials'
                    ? 'Welcome back'
                    : 'Session sync'}
                </CardTitle>
                <CardDescription className="text-center">
                  {loginMethod === 'credentials'
                    ? 'Sign in to continue your treatment support workflow.'
                    : 'Resume your active session from another browser.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert
                      variant="destructive"
                      className="animate-in fade-in slide-in-from-top-1 duration-200"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {loginMethod === 'credentials' ? (
                    <div className="space-y-4 transition-all duration-300">
                      <div className="space-y-2 animate-in fade-in duration-200">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required={loginMethod === 'credentials'}
                        />
                      </div>

                      <div className="space-y-2 animate-in fade-in duration-200">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required={loginMethod === 'credentials'}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="space-y-2">
                        <Label htmlFor="syncToken">Session Sync Token</Label>
                        <textarea
                          id="syncToken"
                          placeholder="Paste your secure session sync token here..."
                          value={syncToken}
                          onChange={(e) => setSyncToken(e.target.value)}
                          required={loginMethod === 'token'}
                          rows={4}
                          className="flex min-h-[100px] w-full rounded-xl border border-input-background bg-input bg-input-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-muted-foreground/15 pr-3 select-all focus:border-primary/50 transition-all duration-200"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground leading-normal">
                        This secure sync token resides in the Profile page of
                        your active session. Make sure it is from an active
                        device that logged in within the past 12 hours.
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 cursor-pointer shadow-md transition-all duration-200"
                    disabled={loading}
                  >
                    {loading
                      ? 'Signing in...'
                      : loginMethod === 'credentials'
                        ? 'Sign In'
                        : 'Sync & Continue'}
                  </Button>

                
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

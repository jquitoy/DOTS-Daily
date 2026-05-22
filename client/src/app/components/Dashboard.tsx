import { useAuth } from '../contexts/AuthContext';
import { formatPersonName } from '../lib/personName';
import { useMedications } from '../contexts/MedicationsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  Pill,
  Settings,
  Shield,
  TrendingUp,
  User,
  Bell,
  ArrowRight,
} from 'lucide-react';

interface DashboardProps {
  onViewChange: (view: string) => void;
  onTriggerAlarm?: (alarm: { id: string; medicationName: string; time: string; dosage: string }) => void;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function Dashboard({ onViewChange, onTriggerAlarm }: DashboardProps) {
  const { user } = useAuth();
  const { medications, alarms, doseLogs } = useMedications();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const todayAlarms = alarms.filter((alarm) => alarm.enabled && alarm.time > currentTime).slice(0, 3);

  const adherenceRate =
    doseLogs.length > 0
      ? Math.round((doseLogs.filter((log) => log.verified).length / doseLogs.length) * 100)
      : 0;

  const treatmentDays = doseLogs.length;
  const totalTreatmentDays = 180;
  const progressPercentage = Math.min((treatmentDays / totalTreatmentDays) * 100, 100);

  const recentDoseDates = [...doseLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  const upcomingMedicationNames = medications.slice(0, 3).map((medication) => medication.name).join(' • ');

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative -mt-8 overflow-hidden bg-gradient-to-br from-primary via-cyan-500 to-teal-400 px-4 pb-32 pt-16 sm:-mt-10 sm:px-6 sm:pt-18 lg:-mt-12 lg:px-8 lg:pt-20">
        <div className="absolute top-10 right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute top-24 left-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-8 right-1/3 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-white/30">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-white/80">Welcome back,</p>
                <p className="text-xl font-bold text-white">
                  {user ? formatPersonName(user) : ''}
                </p>
                <p className="text-xs text-white/75">{today}</p>
              </div>
            </div>

            <button
              onClick={() => onViewChange('profile')}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-3xl border border-white/20 bg-white/15 p-5 text-white shadow-xl backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <p className="text-sm font-medium uppercase tracking-wide">Treatment status</p>
              </div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-bold">{Math.round(progressPercentage)}%</p>
                  <p className="mt-1 text-sm text-white/80">
                    {treatmentDays} of {totalTreatmentDays} treatment days logged
                  </p>
                </div>
                <div className="rounded-2xl bg-white/15 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-wide text-white/70">Current streak</p>
                  <p className="text-lg font-semibold">{doseLogs.length > 0 ? `${doseLogs.length} records` : 'Start logging'}</p>
                </div>
              </div>
              <div className="mt-4 h-3 rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-white to-cyan-100"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="mt-3 text-center text-xs text-white/75">
                Complete your full course for successful recovery.
              </p>
            </div>

            <div className="rounded-3xl border border-white/20 bg-white/15 p-5 text-white shadow-xl backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <p className="text-sm font-medium uppercase tracking-wide">Next follow-up</p>
              </div>
              <p className="text-2xl font-bold">February 16, 2026</p>
              <p className="mt-2 text-sm text-white/80">Keep your review appointments on schedule.</p>
              <div className="mt-4 rounded-2xl bg-white/15 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-white/70">Medication plan</p>
                <p className="mt-1 text-sm font-medium">{upcomingMedicationNames || 'Your medication list will appear here.'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-10 bg-background" style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />
      </div>

      <div className="mx-auto mt-10 max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="shadow-lg transition-shadow duration-300 hover:shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Medications</p>
                  <p className="text-3xl font-bold">{medications.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Daily TB regimen</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Pill className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg transition-shadow duration-300 hover:shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Adherence</p>
                  <p className="text-3xl font-bold">{adherenceRate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Based on dose log</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg transition-shadow duration-300 hover:shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active reminders</p>
                  <p className="text-3xl font-bold">{alarms.filter((alarm) => alarm.enabled).length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Scheduled alarms</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg transition-shadow duration-300 hover:shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Logged doses</p>
                  <p className="text-3xl font-bold">{doseLogs.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Verified and pending</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <History className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Today&apos;s schedule
                </CardTitle>
                <CardDescription>Upcoming medication doses and quick actions</CardDescription>
              </div>
              <Button variant="outline" onClick={() => onViewChange('dose-log')}>
                View full dose log
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {todayAlarms.length > 0 ? (
                <div className="space-y-3">
                  {todayAlarms.map((alarm) => (
                    <div key={alarm.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{alarm.medicationName}</p>
                        <p className="text-sm text-muted-foreground">{alarm.time} {alarm.dosage && `• ${alarm.dosage}`}</p>
                      </div>
                      <Button size="sm" onClick={() => onViewChange('dose-log')}>
                        Log dose
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No upcoming doses scheduled for today.</p>
                  <Button variant="outline" className="mt-4" onClick={() => onViewChange('alarms')}>
                    Set up reminders
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Quick summary
              </CardTitle>
              <CardDescription>Fast access to treatment and support views</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-between" variant="outline" onClick={() => onViewChange('dose-log')}>
                Dose log
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button className="w-full justify-between" variant="outline" onClick={() => onViewChange('medications')}>
                Medications
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button className="w-full justify-between" variant="outline" onClick={() => onViewChange('symptoms')}>
                Symptom monitor
                <ArrowRight className="h-4 w-4" />
              </Button>
              <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                You can review your medication history and the exact dates you took each dose below.
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Medication history
            </CardTitle>
            <CardDescription>Dates and times you recorded each medication intake</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDoseDates.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                No medication history yet. Log a dose to begin tracking your dates.
              </div>
            ) : (
              <div className="space-y-3">
                {recentDoseDates.map((log) => (
                  <div key={log.id} className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${log.verified ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                        <CheckCircle2 className={`h-5 w-5 ${log.verified ? 'text-emerald-600' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{log.medicationName}</p>
                          <Badge variant={log.verified ? 'default' : 'secondary'}>
                            {log.verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Taken on {formatDateTime(log.timestamp)}</p>
                        <p className="text-xs text-muted-foreground">Date: {formatDate(log.timestamp)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => onViewChange('dose-log')}>
                      View in log
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50 shadow-md transition-shadow duration-300 hover:shadow-lg">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">TB symptom monitor</CardTitle>
                <CardDescription className="mt-1">Track TB symptoms and medication side effects for early intervention</CardDescription>
                <Button variant="outline" className="mt-3" onClick={() => onViewChange('symptoms')}>
                  Check symptoms
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {onTriggerAlarm && (
          <Card className="border-primary/20 bg-primary/5 shadow-md transition-shadow duration-300 hover:shadow-lg">
            <CardContent className="pt-6">
              <Button
                onClick={() =>
                  onTriggerAlarm({
                    id: 'test-alarm',
                    medicationName: 'Rifampicin + Isoniazid',
                    time: '08:00 AM',
                    dosage: '2 tablets',
                  })
                }
                className="w-full"
              >
                <Clock className="mr-2 h-4 w-4" />
                Test medication alarm
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">Demo: simulate an alarm notification</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

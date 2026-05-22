import { useAuth } from '../contexts/AuthContext';
import { useMedications } from '../contexts/MedicationsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Pill, 
  Calendar, 
  Activity, 
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  User,
  Search,
  Settings
} from 'lucide-react';

interface DashboardProps {
  onViewChange: (view: string) => void;
  onTriggerAlarm?: (alarm: { id: string; medicationName: string; time: string; dosage: string }) => void;
}

export function Dashboard({ onViewChange, onTriggerAlarm }: DashboardProps) {
  const { user } = useAuth();
  const { medications, alarms, doseLogs } = useMedications();

  // Get today's date
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Get upcoming alarms for today
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const todayAlarms = alarms.filter(alarm => alarm.enabled && alarm.time > currentTime).slice(0, 3);

  // Calculate adherence rate
  const adherenceRate = doseLogs.length > 0 
    ? Math.round((doseLogs.filter(log => log.verified).length / doseLogs.length) * 100)
    : 0;

  // Calculate treatment progress (mock: based on dose logs)
  const treatmentDays = doseLogs.length;
  const totalTreatmentDays = 180; // 6 months
  const progressPercentage = Math.min((treatmentDays / totalTreatmentDays) * 100, 100);

  return (
    <div className="pb-[42px] pt-[0px] pr-[0px] pl-[0px]">
      {/* Curved Header Section */}
      <div className="relative bg-gradient-to-br from-primary via-cyan-500 to-teal-400 px-4 sm:px-6 lg:px-8 pt-6 pb-32">
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute top-20 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* User Profile Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center ring-4 ring-white/30 shadow-lg">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Welcome back,</p>
                <p className="text-white font-bold text-xl">{user?.name}</p>
              </div>
            </div>
            <button 
              onClick={() => onViewChange('profile')}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Follow-up Reminder */}
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 mb-4 border border-white/30">
            <div className="flex items-center gap-2 justify-center">
              <Calendar className="w-4 h-4 text-white" />
              <p className="text-white text-sm font-medium">
                Your next follow-up is on <span className="font-bold">February 16, 2026</span>
              </p>
            </div>
          </div>

          {/* Treatment Progress Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground">Treatment Progress</p>
                <p className="text-2xl font-bold text-foreground mt-1">{Math.round(progressPercentage)}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Day {treatmentDays} of {totalTreatmentDays}</p>
                <p className="text-xs text-primary font-medium mt-1">Keep going! 💪</p>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-teal-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Complete your full course for successful recovery
            </p>
          </div>
        </div>

        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-background" style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }}></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 -mt-16">
        {/* Quick Stats - Compressed into one row */}
        <div className="flex justify-center">
          <div className="grid grid-cols-3 gap-4 max-w-2xl px-[0px] py-[70px] pt-[70px] pr-[0px] pb-[3px] pl-[0px]">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="pt-7 pb-7 text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Pill className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{medications.length}</div>
                <p className="text-sm font-medium text-muted-foreground">TB Meds</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Daily drugs
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="pt-7 pb-7 text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{adherenceRate}%</div>
                <p className="text-sm font-medium text-muted-foreground">Adherence</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {doseLogs.length} doses
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{alarms.filter(a => a.enabled).length}</div>
                <p className="text-sm font-medium text-muted-foreground">Reminders</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Active alarms
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upcoming Doses */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Upcoming medication doses</CardDescription>
          </CardHeader>
          <CardContent>
            {todayAlarms.length > 0 ? (
              <div className="space-y-3">
                {todayAlarms.map((alarm) => (
                  <div
                    key={alarm.id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{alarm.medicationName}</p>
                      <p className="text-sm text-muted-foreground">
                        {alarm.time} {alarm.dosage && `• ${alarm.dosage}`}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => onViewChange('dose-log')}
                    >
                      Log Dose
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No upcoming doses scheduled for today</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => onViewChange('alarms')}
                >
                  Set Up Alarms
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Check Reminder */}
        <Card className="border-orange-200 bg-orange-50/50 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-start gap-4 px-[0px] py-[5px]">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">TB Symptom Monitor</CardTitle>
                <CardDescription className="mt-1">
                  Track TB symptoms and medication side effects for early intervention
                </CardDescription>
                <Button 
                  variant="outline" 
                  className="mt-3"
                  onClick={() => onViewChange('symptoms')}
                >
                  Check Symptoms
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Treatment Info Card */}
        <Card className="border-blue-200 bg-blue-50/50 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">Treatment Reminder</CardTitle>
                <CardDescription className="mt-1">
                  <strong>Remember:</strong> Complete your full 6-month TB treatment course. Stopping early can lead to drug-resistant TB. Take all medications together as prescribed by your doctor.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Test Alarm Button (for demo) */}
        {onTriggerAlarm && (
          <Card className="border-primary/20 bg-primary/5 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="pt-6">
              <Button 
                onClick={() => onTriggerAlarm({
                  id: 'test-alarm',
                  medicationName: 'Rifampicin + Isoniazid',
                  time: '08:00 AM',
                  dosage: '2 tablets'
                })}
                className="w-full"
              >
                <Clock className="w-4 h-4 mr-2" />
                Test Medication Alarm
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Demo: Simulate an alarm notification
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
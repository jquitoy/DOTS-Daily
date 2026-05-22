import { useMedications } from '../contexts/MedicationsContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Bell, BellOff, Clock } from 'lucide-react';
import { toast } from 'sonner';

export function AlarmsPage() {
  const { alarms, toggleAlarm } = useMedications();

  const handleToggle = (id: string, enabled: boolean) => {
    toggleAlarm(id);
    toast.success(enabled ? 'Alarm disabled' : 'Alarm enabled');
  };

  const sortedAlarms = [...alarms].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1>Medication Alarms</h1>
        <p className="text-muted-foreground mt-1">
          Manage your medication reminders
        </p>
      </div>

      {alarms.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="mb-2">No alarms configured</h3>
            <p className="text-muted-foreground">
              Add medications to set up reminder alarms
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>
                {alarms.filter((a) => a.enabled).length} active alarms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedAlarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        alarm.enabled ? 'bg-blue-100' : 'bg-gray-100'
                      }`}
                    >
                      {alarm.enabled ? (
                        <Bell
                          className={`w-6 h-6 ${alarm.enabled ? 'text-blue-600' : 'text-gray-400'}`}
                        />
                      ) : (
                        <BellOff className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{alarm.medicationName}</p>
                        {!alarm.enabled && (
                          <Badge variant="secondary" className="text-xs">
                            Disabled
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{alarm.time}</span>
                        <span>•</span>
                        <span>{alarm.days.join(', ')}</span>
                      </div>
                      {alarm.lastTaken && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last taken:{' '}
                          {new Date(alarm.lastTaken).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={alarm.enabled}
                    onCheckedChange={() =>
                      handleToggle(alarm.id, alarm.enabled)
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alarm Settings</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications on your device
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sound Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Play a sound when alarm goes off
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Snooze Option</p>
                  <p className="text-sm text-muted-foreground">
                    Allow snoozing alarms for 10 minutes
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Persistent Reminder</p>
                  <p className="text-sm text-muted-foreground">
                    Remind every 5 minutes until confirmed
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

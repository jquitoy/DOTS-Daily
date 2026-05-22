import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { 
  Shield, 
  Users, 
  Activity, 
  Pill, 
  Camera,
  TrendingUp,
  AlertCircle,
  Search,
  Eye,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  LogOut,
  BarChart3,
  Video,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

// Mock patient data based on the mobile patient view
const mockPatients = [
  { 
    id: '1', 
    name: 'Jane Smith', 
    age: 34,
    email: 'user@doti.com', 
    phone: '+1 234-567-8901',
    status: 'active',
    treatmentDays: 45,
    totalTreatmentDays: 180,
    adherenceRate: 94,
    medications: [
      { name: 'Rifampicin', dosage: '600mg', frequency: 'Once daily' },
      { name: 'Isoniazid', dosage: '300mg', frequency: 'Once daily' },
      { name: 'Pyrazinamide', dosage: '1500mg', frequency: 'Once daily' },
      { name: 'Ethambutol', dosage: '1200mg', frequency: 'Once daily' },
    ],
    nextFollowUp: 'February 16, 2026',
    recentDoses: [
      { date: '2026-01-15', time: '08:00 AM', medication: 'Rifampicin', verified: true, hasMedia: true },
      { date: '2026-01-14', time: '08:00 AM', medication: 'Rifampicin', verified: true, hasMedia: true },
      { date: '2026-01-13', time: '08:00 AM', medication: 'Rifampicin', verified: false, hasMedia: false },
    ],
    upcomingAlarms: [
      { time: '08:00 AM', medication: 'Morning TB Meds', dosage: '4 tablets' },
    ],
    recentSymptoms: [],
    lastActive: '2 hours ago'
  },
  { 
    id: '2', 
    name: 'John Doe', 
    age: 42,
    email: 'john.doe@email.com', 
    phone: '+1 234-567-8902',
    status: 'active',
    treatmentDays: 120,
    totalTreatmentDays: 180,
    adherenceRate: 87,
    medications: [
      { name: 'Rifampicin + Isoniazid', dosage: '600mg/300mg', frequency: 'Once daily' },
      { name: 'Pyrazinamide', dosage: '1500mg', frequency: 'Once daily' },
    ],
    nextFollowUp: 'February 20, 2026',
    recentDoses: [
      { date: '2026-01-15', time: '09:00 AM', medication: 'Rifampicin + Isoniazid', verified: true, hasMedia: true },
      { date: '2026-01-14', time: '09:00 AM', medication: 'Rifampicin + Isoniazid', verified: true, hasMedia: false },
    ],
    upcomingAlarms: [
      { time: '09:00 AM', medication: 'TB Medication', dosage: '2 tablets' },
    ],
    recentSymptoms: [
      { symptom: 'Mild nausea', severity: 'low', date: '2026-01-14' }
    ],
    lastActive: '1 day ago'
  },
  { 
    id: '3', 
    name: 'Mary Johnson', 
    age: 28,
    email: 'mary.j@email.com', 
    phone: '+1 234-567-8903',
    status: 'active',
    treatmentDays: 15,
    totalTreatmentDays: 180,
    adherenceRate: 98,
    medications: [
      { name: 'Rifampicin', dosage: '450mg', frequency: 'Once daily' },
      { name: 'Isoniazid', dosage: '300mg', frequency: 'Once daily' },
      { name: 'Pyrazinamide', dosage: '1000mg', frequency: 'Once daily' },
      { name: 'Ethambutol', dosage: '800mg', frequency: 'Once daily' },
      { name: 'Vitamin B6', dosage: '25mg', frequency: 'Once daily' },
    ],
    nextFollowUp: 'January 30, 2026',
    recentDoses: [
      { date: '2026-01-15', time: '07:30 AM', medication: 'Rifampicin', verified: true, hasMedia: true },
      { date: '2026-01-14', time: '07:30 AM', medication: 'Rifampicin', verified: true, hasMedia: true },
      { date: '2026-01-13', time: '07:30 AM', medication: 'Rifampicin', verified: true, hasMedia: true },
    ],
    upcomingAlarms: [
      { time: '07:30 AM', medication: 'Morning TB Regimen', dosage: '5 tablets' },
    ],
    recentSymptoms: [],
    lastActive: '30 mins ago'
  },
  { 
    id: '4', 
    name: 'Robert Brown', 
    age: 55,
    email: 'rbrown@email.com', 
    phone: '+1 234-567-8904',
    status: 'at-risk',
    treatmentDays: 90,
    totalTreatmentDays: 180,
    adherenceRate: 45,
    medications: [
      { name: 'Rifampicin', dosage: '600mg', frequency: 'Once daily' },
      { name: 'Isoniazid', dosage: '300mg', frequency: 'Once daily' },
    ],
    nextFollowUp: 'January 18, 2026',
    recentDoses: [
      { date: '2026-01-14', time: '10:00 AM', medication: 'Rifampicin', verified: false, hasMedia: false },
      { date: '2026-01-12', time: '10:00 AM', medication: 'Rifampicin', verified: false, hasMedia: false },
    ],
    upcomingAlarms: [
      { time: '10:00 AM', medication: 'TB Medication', dosage: '2 tablets' },
    ],
    recentSymptoms: [
      { symptom: 'Persistent cough', severity: 'high', date: '2026-01-15' },
      { symptom: 'Night sweats', severity: 'medium', date: '2026-01-14' }
    ],
    lastActive: '1 week ago'
  },
  { 
    id: '5', 
    name: 'Lisa Davis', 
    age: 31,
    email: 'ldavis@email.com', 
    phone: '+1 234-567-8905',
    status: 'active',
    treatmentDays: 60,
    totalTreatmentDays: 180,
    adherenceRate: 91,
    medications: [
      { name: 'Rifampicin + Isoniazid', dosage: '600mg/300mg', frequency: 'Once daily' },
      { name: 'Pyrazinamide', dosage: '1500mg', frequency: 'Once daily' },
      { name: 'Ethambutol', dosage: '1200mg', frequency: 'Once daily' },
    ],
    nextFollowUp: 'February 10, 2026',
    recentDoses: [
      { date: '2026-01-15', time: '08:30 AM', medication: 'Rifampicin + Isoniazid', verified: true, hasMedia: true },
      { date: '2026-01-14', time: '08:30 AM', medication: 'Rifampicin + Isoniazid', verified: true, hasMedia: false },
      { date: '2026-01-13', time: '08:30 AM', medication: 'Rifampicin + Isoniazid', verified: true, hasMedia: true },
    ],
    upcomingAlarms: [
      { time: '08:30 AM', medication: 'Morning TB Meds', dosage: '3 tablets' },
    ],
    recentSymptoms: [
      { symptom: 'Mild fatigue', severity: 'low', date: '2026-01-13' }
    ],
    lastActive: '3 hours ago'
  },
];

const systemStats = {
  totalPatients: mockPatients.length,
  activePatients: mockPatients.filter(p => p.status === 'active').length,
  atRiskPatients: mockPatients.filter(p => p.status === 'at-risk').length,
  avgAdherence: Math.round(mockPatients.reduce((sum, p) => sum + p.adherenceRate, 0) / mockPatients.length),
  dosesVerifiedToday: 12,
  upcomingFollowUps: mockPatients.filter(p => new Date(p.nextFollowUp) < new Date('2026-02-01')).length,
};

export function AdminPortal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'patients'>('dashboard');

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentPatient = selectedPatient 
    ? mockPatients.find(p => p.id === selectedPatient)
    : null;

  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Turquoise gradient matching the patient app */}
      <div className="relative bg-gradient-to-br from-primary via-cyan-500 to-teal-400 px-6 py-6 shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">DOTS Daily Admin</h1>
                <p className="text-white/80 text-sm">TB Patient Management Portal</p>
              </div>
            </div>
            <Button 
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6">
            <button
              onClick={() => {
                setView('dashboard');
                setSelectedPatient(null);
              }}
              className={`px-4 py-4 border-b-2 transition-colors font-medium ${
                view === 'dashboard' && !selectedPatient
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => {
                setView('patients');
                setSelectedPatient(null);
              }}
              className={`px-4 py-4 border-b-2 transition-colors font-medium ${
                view === 'patients' && !selectedPatient
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Patients
            </button>
            {selectedPatient && (
              <button
                className="px-4 py-4 border-b-2 border-primary text-primary font-medium"
              >
                <Eye className="w-4 h-4 inline mr-2" />
                Patient Details
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard View */}
        {view === 'dashboard' && !selectedPatient && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Patients</p>
                      <p className="text-3xl font-bold">{systemStats.totalPatients}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {systemStats.activePatients} active
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Avg Adherence</p>
                      <p className="text-3xl font-bold">{systemStats.avgAdherence}%</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Across all patients
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">At-Risk Patients</p>
                      <p className="text-3xl font-bold">{systemStats.atRiskPatients}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Require attention
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle className="w-7 h-7 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Verified Doses Today</p>
                      <p className="text-3xl font-bold">{systemStats.dosesVerifiedToday}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        With photo/video
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Camera className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Upcoming Follow-ups</p>
                      <p className="text-3xl font-bold">{systemStats.upcomingFollowUps}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        This month
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Medications</p>
                      <p className="text-3xl font-bold">
                        {mockPatients.reduce((sum, p) => sum + p.medications.length, 0)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Prescribed drugs
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Pill className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* At-Risk Patients Alert */}
            {systemStats.atRiskPatients > 0 && (
              <Card className="border-red-200 bg-red-50/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base text-red-900">Patients Requiring Attention</CardTitle>
                      <CardDescription className="mt-2">
                        The following patients have low adherence rates or recent symptoms that require monitoring
                      </CardDescription>
                      <div className="mt-4 space-y-2">
                        {mockPatients.filter(p => p.status === 'at-risk').map(patient => (
                          <div key={patient.id} className="bg-white rounded-lg p-3 border border-red-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-foreground">{patient.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Adherence: {patient.adherenceRate}% • Last active: {patient.lastActive}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedPatient(patient.id);
                                  setView('patients');
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

            {/* Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Dose Verifications</CardTitle>
                  <CardDescription>Latest patient dose logs with media</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockPatients.slice(0, 4).map((patient) => {
                      const recentDose = patient.recentDoses[0];
                      if (!recentDose) return null;
                      return (
                        <div key={patient.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            recentDose.verified ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            {recentDose.verified ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{patient.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {recentDose.medication} • {recentDose.time}
                            </p>
                          </div>
                          {recentDose.hasMedia && (
                            <Video className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Upcoming Follow-up Appointments</CardTitle>
                  <CardDescription>Scheduled patient visits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockPatients
                      .sort((a, b) => new Date(a.nextFollowUp).getTime() - new Date(b.nextFollowUp).getTime())
                      .slice(0, 4)
                      .map((patient) => (
                        <div key={patient.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{patient.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {patient.nextFollowUp}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedPatient(patient.id);
                              setView('patients');
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Patients List View */}
        {view === 'patients' && !selectedPatient && (
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle>Patient Directory</CardTitle>
                    <CardDescription>View and manage TB DOTS patients</CardDescription>
                  </div>
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Treatment Progress</TableHead>
                      <TableHead>Adherence</TableHead>
                      <TableHead>Medications</TableHead>
                      <TableHead>Next Follow-up</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => {
                      const progressPercentage = (patient.treatmentDays / patient.totalTreatmentDays) * 100;
                      return (
                        <TableRow key={patient.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-sm text-muted-foreground">{patient.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={patient.status === 'active' ? 'default' : 'destructive'}
                              className={patient.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                            >
                              {patient.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Day {patient.treatmentDays}/{patient.totalTreatmentDays}</span>
                                <span className="font-medium">{Math.round(progressPercentage)}%</span>
                              </div>
                              <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-primary to-teal-400 rounded-full"
                                  style={{ width: `${progressPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{patient.adherenceRate}%</span>
                              {patient.adherenceRate >= 90 ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : patient.adherenceRate < 70 ? (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{patient.medications.length}</span>
                            <span className="text-sm text-muted-foreground ml-1">drugs</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{patient.nextFollowUp}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedPatient(patient.id)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Patient Detail View */}
        {selectedPatient && currentPatient && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedPatient(null)}
              >
                ← Back to Patients
              </Button>
            </div>

            {/* Patient Header */}
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{currentPatient.name}</h2>
                      <p className="text-muted-foreground">{currentPatient.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Age: {currentPatient.age} • Phone: {currentPatient.phone}
                      </p>
                      <div className="mt-2">
                        <Badge 
                          variant={currentPatient.status === 'active' ? 'default' : 'destructive'}
                          className={currentPatient.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                        >
                          {currentPatient.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Last Active</p>
                    <p className="font-medium">{currentPatient.lastActive}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Treatment Progress */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Treatment Progress</CardTitle>
                <CardDescription>TB DOTS therapy progress tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Treatment Day</p>
                      <p className="text-2xl font-bold">{currentPatient.treatmentDays}</p>
                      <p className="text-xs text-muted-foreground">of {currentPatient.totalTreatmentDays} days</p>
                    </div>
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Progress</p>
                      <p className="text-2xl font-bold">
                        {Math.round((currentPatient.treatmentDays / currentPatient.totalTreatmentDays) * 100)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Complete</p>
                    </div>
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Adherence Rate</p>
                      <p className="text-2xl font-bold">{currentPatient.adherenceRate}%</p>
                      <p className="text-xs text-muted-foreground">Compliance</p>
                    </div>
                  </div>
                  <div className="w-full h-4 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-teal-400 transition-all duration-500 rounded-full"
                      style={{ width: `${(currentPatient.treatmentDays / currentPatient.totalTreatmentDays) * 100}%` }}
                    ></div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Next Follow-up Appointment</p>
                      <p className="text-sm text-blue-700">{currentPatient.nextFollowUp}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Two Column Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Current Medications */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Current TB Medications</CardTitle>
                  <CardDescription>{currentPatient.medications.length} prescribed drugs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentPatient.medications.map((med, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Pill className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{med.name}</p>
                          <p className="text-sm text-muted-foreground">{med.dosage}</p>
                          <p className="text-xs text-muted-foreground mt-1">{med.frequency}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Schedule */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Today's Medication Schedule</CardTitle>
                  <CardDescription>Upcoming alarms and doses</CardDescription>
                </CardHeader>
                <CardContent>
                  {currentPatient.upcomingAlarms.length > 0 ? (
                    <div className="space-y-3">
                      {currentPatient.upcomingAlarms.map((alarm, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{alarm.medication}</p>
                            <p className="text-sm text-muted-foreground">
                              {alarm.time} • {alarm.dosage}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No upcoming doses scheduled</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Dose Logs */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Recent Dose Logs</CardTitle>
                <CardDescription>Patient medication verification history</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Verification Status</TableHead>
                      <TableHead>Media</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPatient.recentDoses.map((dose, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{dose.date}</p>
                            <p className="text-sm text-muted-foreground">{dose.time}</p>
                          </div>
                        </TableCell>
                        <TableCell>{dose.medication}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {dose.verified ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-green-600 font-medium">Verified</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-gray-400" />
                                <span className="text-muted-foreground">Not Verified</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {dose.hasMedia ? (
                            <div className="flex items-center gap-2 text-primary">
                              <Video className="w-4 h-4" />
                              <span className="text-sm">Available</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">None</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Symptoms Report */}
            {currentPatient.recentSymptoms.length > 0 && (
              <Card className="border-orange-200 bg-orange-50/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base text-orange-900">Recent Symptoms Reported</CardTitle>
                      <CardDescription className="mt-2">
                        Patient has reported the following symptoms or side effects
                      </CardDescription>
                      <div className="mt-4 space-y-2">
                        {currentPatient.recentSymptoms.map((symptom, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 border border-orange-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-foreground">{symptom.symptom}</p>
                                <p className="text-sm text-muted-foreground">{symptom.date}</p>
                              </div>
                              <Badge 
                                variant={symptom.severity === 'high' ? 'destructive' : 'secondary'}
                                className={symptom.severity === 'low' ? 'bg-green-100 text-green-700' : ''}
                              >
                                {symptom.severity} severity
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
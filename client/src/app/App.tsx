import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MedicationsProvider } from './contexts/MedicationsContext';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { ProfilePage } from './components/ProfilePage';
import { MedicationsHub } from './components/MedicationsHub';
import { ChatbotPage } from './components/ChatbotPage';
import { SymptomsPage } from './components/SymptomsPage';
import { AdminPortal } from './components/AdminPortal';
import { AlarmNotificationScreen } from './components/AlarmNotificationScreen';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { ShieldAlert } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

function AdminAccessDenied({ onReturnHome }: { onReturnHome: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
      <Card className="w-full max-w-xl border-primary/20 shadow-2xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary via-cyan-500 to-teal-400" />
        <CardHeader className="text-center pt-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Admin access required</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            This area is reserved for administrators only. User management, role changes, and audit logs are protected.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8 flex justify-center">
          <Button onClick={onReturnHome} className="bg-primary hover:bg-primary/90">
            Return to dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function AppContent() {
  const { user } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeAlarm, setActiveAlarm] = useState<{
    id: string;
    medicationName: string;
    time: string;
    dosage: string;
  } | null>(null);

  // Automatically redirect admins to admin portal
  useEffect(() => {
    if (!user) {
      setCurrentView('dashboard');
      setActiveAlarm(null);
      return;
    }

    if (user.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('dashboard');
    }
  }, [user?.id, user?.role]);

  const handleAlarmComplete = (photoUrl: string, videoUrl: string) => {
    // In a real app, this would save to the dose log
    console.log('Dose completed:', { alarm: activeAlarm, photoUrl, videoUrl });
    setActiveAlarm(null);
  };

  const handleAlarmDismiss = () => {
    setActiveAlarm(null);
  };

  // Show auth screens if not logged in
  if (!user) {
    return (
      <>
        {authView === 'login' ? (
          <LoginPage onSwitchToSignup={() => setAuthView('signup')} />
        ) : (
          <SignupPage onSwitchToLogin={() => setAuthView('login')} />
        )}
        <Toaster />
      </>
    );
  }

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} onTriggerAlarm={setActiveAlarm} />;
      case 'profile':
        return <ProfilePage onViewChange={setCurrentView} />;
      case 'medications':
      case 'alarms':
      case 'dose-log':
        return <MedicationsHub />;
      case 'chatbot':
        return <ChatbotPage />;
      case 'symptoms':
        return <SymptomsPage />;
      case 'admin':
        return user.role === 'admin' ? (
          <AdminPortal />
        ) : (
          <AdminAccessDenied onReturnHome={() => setCurrentView('dashboard')} />
        );
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {currentView !== 'admin' && (
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
      )}
      {renderView()}
      
      {/* Alarm Notification Screen */}
      {activeAlarm && (
        <AlarmNotificationScreen 
          alarm={activeAlarm}
          onDismiss={handleAlarmDismiss}
          onComplete={handleAlarmComplete}
        />
      )}
      
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MedicationsProvider>
        <AppContent />
      </MedicationsProvider>
    </AuthProvider>
  );
}
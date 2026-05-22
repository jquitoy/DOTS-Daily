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
import { Toaster } from './components/ui/sonner';

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
    if (user?.role === 'admin' && currentView === 'dashboard') {
      setCurrentView('admin');
    }
  }, [user?.role, currentView]);

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
        return user.role === 'admin' ? <AdminPortal /> : <Dashboard onViewChange={setCurrentView} />;
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className={`min-h-screen bg-background ${currentView !== 'admin' ? 'pb-16' : ''}`}>
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
import { useState, useEffect, type ReactNode } from 'react';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './components/ui/card';
import { ShieldAlert } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';

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
            This area is reserved for administrators only. User management, role
            changes, and audit logs are protected.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8 flex justify-center">
          <Button
            onClick={onReturnHome}
            className="bg-primary hover:bg-primary/90"
          >
            Return to dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <AdminAccessDenied onReturnHome={() => navigate('/dashboard')} />
    );
  }

  return <>{children}</>;
}

function AppContent() {
  const { user } = useAuth();
  const [activeAlarm, setActiveAlarm] = useState<{
    id: string;
    medicationName: string;
    time: string;
    dosage: string;
  } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentView = () => {
    if (location.pathname.startsWith('/medications')) return 'medications';
    if (location.pathname.startsWith('/chatbot')) return 'chatbot';
    if (location.pathname.startsWith('/symptoms')) return 'symptoms';
    if (location.pathname.startsWith('/profile')) return 'profile';
    if (location.pathname === '/admin') return 'admin';
    return 'dashboard';
  };

  const currentView = getCurrentView();

  const viewToPath = (view: string) => {
    switch (view) {
      case 'dashboard':
        return '/dashboard';
      case 'profile':
        return '/profile';
      case 'medications':
        return '/medications';
      case 'chatbot':
        return '/chatbot';
      case 'symptoms':
        return '/symptoms';
      default:
        return '/dashboard';
    }
  };

  useEffect(() => {
    if (!user && !['/login', '/signup'].includes(location.pathname)) {
      navigate('/login', { replace: true });
      return;
    }

    if (user && ['/login', '/signup', '/'].includes(location.pathname)) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const handleAlarmComplete = (photoUrl: string, videoUrl: string) => {
    console.log('Dose completed:', { alarm: activeAlarm, photoUrl, videoUrl });
    setActiveAlarm(null);
  };

  const handleAlarmDismiss = () => {
    setActiveAlarm(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {user && location.pathname !== '/admin' && (
        <Navigation
          currentView={currentView}
          onViewChange={(view) => navigate(viewToPath(view))}
        />
      )}

      <Routes>
        <Route
          path="/login"
          element={<LoginPage onSwitchToSignup={() => navigate('/signup')} />}
        />
        <Route
          path="/signup"
          element={<SignupPage onSwitchToLogin={() => navigate('/login')} />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard onViewChange={() => navigate('/dashboard')} onTriggerAlarm={setActiveAlarm} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage onViewChange={() => navigate('/profile')} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medications"
          element={
            <ProtectedRoute>
              <MedicationsHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <ChatbotPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/symptoms"
          element={
            <ProtectedRoute>
              <SymptomsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPortal />
            </AdminRoute>
          }
        />
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="*"
          element={
            user ? (
              <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>

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

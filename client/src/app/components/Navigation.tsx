import { useAuth } from '../contexts/AuthContext';
import { 
  Activity,
  ArrowRight,
  Bell,
  Home,
  LogOut,
  MessageCircle,
  Pill,
  Shield,
  User,
} from 'lucide-react';
import { Button } from './ui/button';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'chatbot', label: 'AI Chat', icon: MessageCircle },
    { id: 'symptoms', label: 'Symptoms', icon: Activity },
  ];

  // Determine which view should highlight the medications icon
  const getMedicationsActive = () => {
    return currentView === 'medications' || 
           currentView === 'alarms' || 
           currentView === 'dose-log';
  };

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-white/20 bg-gradient-to-br from-primary via-cyan-500 to-teal-400 shadow-lg">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-white/80">Welcome back,</p>
                <p className="text-lg font-bold">{user?.name}</p>
                <p className="text-xs text-white/75">User portal</p>
              </div>
            </div>

            <Button
              variant="secondary"
              className="border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 rounded-2xl border border-white/20 bg-white/15 p-2 backdrop-blur-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'medications' ? getMedicationsActive() : currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex min-w-[120px] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-white/85 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-white/90'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { 
  Pill, 
  Home, 
  MessageCircle, 
  Activity, 
  User, 
  LogOut,
  Shield
} from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { user, logout } = useAuth();

  const bottomNavItems = [
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
      {/* Bottom Navigation - Icons Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 pb-safe">
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex justify-around items-center h-16">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'medications' 
                ? getMedicationsActive() 
                : currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-lg transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'fill-primary/10' : ''}`} />
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
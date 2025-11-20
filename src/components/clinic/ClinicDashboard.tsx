import { useState } from 'react';
import { Home, Calendar, Users, MessageCircle, BarChart, User, LogOut } from 'lucide-react';
import type { User as UserType } from '../../App';
import { ClinicHome } from './ClinicHome';
import { PatientList } from './PatientList';
import { ClinicAppointments } from './ClinicAppointments';
import { ClinicMessages } from './ClinicMessages';
import { ClinicProfile } from './ClinicProfile';

interface ClinicDashboardProps {
  user: UserType;
  onLogout: () => void;
}

type ClinicView = 'home' | 'patients' | 'appointments' | 'messages' | 'profile';

export function ClinicDashboard({ user, onLogout }: ClinicDashboardProps) {
  const [currentView, setCurrentView] = useState<ClinicView>('home');

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <ClinicHome user={user} onNavigate={setCurrentView} />;
      case 'patients':
        return <PatientList user={user} />;
      case 'appointments':
        return <ClinicAppointments user={user} />;
      case 'messages':
        return <ClinicMessages user={user} />;
      case 'profile':
        return <ClinicProfile user={user} onLogout={onLogout} />;
      default:
        return <ClinicHome user={user} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Main Content */}
      <div className="h-full">
        {renderView()}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button
            onClick={() => setCurrentView('home')}
            className={`flex flex-col items-center gap-1 p-2 ${
              currentView === 'home' ? 'text-purple-500' : 'text-gray-500'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </button>
          
          <button
            onClick={() => setCurrentView('patients')}
            className={`flex flex-col items-center gap-1 p-2 ${
              currentView === 'patients' ? 'text-purple-500' : 'text-gray-500'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">Patients</span>
          </button>
          
          <button
            onClick={() => setCurrentView('appointments')}
            className={`flex flex-col items-center gap-1 p-2 ${
              currentView === 'appointments' ? 'text-purple-500' : 'text-gray-500'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Appointments</span>
          </button>
          
          <button
            onClick={() => setCurrentView('messages')}
            className={`flex flex-col items-center gap-1 p-2 relative ${
              currentView === 'messages' ? 'text-purple-500' : 'text-gray-500'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">Messages</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <button
            onClick={() => setCurrentView('profile')}
            className={`flex flex-col items-center gap-1 p-2 ${
              currentView === 'profile' ? 'text-purple-500' : 'text-gray-500'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

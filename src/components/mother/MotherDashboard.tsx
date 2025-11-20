import { useState } from 'react';
import { Home, Calendar, BookOpen, MessageCircle, Bell, User, Phone } from 'lucide-react';
import type { User } from '../../App';
import { MotherHome } from './MotherHome';
import { PregnancyTracker } from './PregnancyTracker';
import { Appointments } from './Appointments';
import { Education } from './Education';
import { Chat } from './Chat';
import { Notifications } from './Notifications';
import { Profile } from './Profile';

interface MotherDashboardProps {
  user: User;
  onLogout: () => void;
}

type MotherView = 'home' | 'tracker' | 'appointments' | 'education' | 'chat' | 'notifications' | 'profile';

export function MotherDashboard({ user, onLogout }: MotherDashboardProps) {
  const [currentView, setCurrentView] = useState<MotherView>('home');

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <MotherHome user={user} onNavigate={setCurrentView} />;
      case 'tracker':
        return <PregnancyTracker user={user} />;
      case 'appointments':
        return <Appointments user={user} />;
      case 'education':
        return <Education />;
      case 'chat':
        return <Chat user={user} />;
      case 'notifications':
        return <Notifications user={user} />;
      case 'profile':
        return <Profile user={user} onLogout={onLogout} />;
      default:
        return <MotherHome user={user} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Main Content */}
      <div className="h-full">
        {renderView()}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-bottom">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button
            onClick={() => setCurrentView('home')}
            className={`flex flex-col items-center gap-1 p-2 ${
              currentView === 'home' ? 'text-pink-500' : 'text-gray-500'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </button>
          
          <button
            onClick={() => setCurrentView('tracker')}
            className={`flex flex-col items-center gap-1 p-2 ${
              currentView === 'tracker' ? 'text-pink-500' : 'text-gray-500'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Tracker</span>
          </button>
          
          <button
            onClick={() => setCurrentView('education')}
            className={`flex flex-col items-center gap-1 p-2 ${
              currentView === 'education' ? 'text-pink-500' : 'text-gray-500'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Learn</span>
          </button>
          
          <button
            onClick={() => setCurrentView('chat')}
            className={`flex flex-col items-center gap-1 p-2 relative ${
              currentView === 'chat' ? 'text-pink-500' : 'text-gray-500'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">Chat</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <button
            onClick={() => setCurrentView('profile')}
            className={`flex flex-col items-center gap-1 p-2 ${
              currentView === 'profile' ? 'text-pink-500' : 'text-gray-500'
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

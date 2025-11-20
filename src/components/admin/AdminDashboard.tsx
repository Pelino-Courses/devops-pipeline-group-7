import { useState } from 'react';
import { Home, Users, Building, BookOpen, BarChart, User } from 'lucide-react';
import type { User as UserType } from '../../App';
import { AdminHome } from './AdminHome';
import { UserManagement } from './UserManagement';
import { ClinicManagement } from './ClinicManagement';
import { ContentManagement } from './ContentManagement';
import { AdminProfile } from './AdminProfile';

interface AdminDashboardProps {
  user: UserType;
  onLogout: () => void;
}

type AdminView = 'home' | 'users' | 'clinics' | 'content' | 'profile';

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<AdminView>('home');

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <AdminHome user={user} onNavigate={setCurrentView} />;
      case 'users':
        return <UserManagement />;
      case 'clinics':
        return <ClinicManagement />;
      case 'content':
        return <ContentManagement />;
      case 'profile':
        return <AdminProfile user={user} onLogout={onLogout} />;
      default:
        return <AdminHome user={user} onNavigate={setCurrentView} />;
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
              currentView === 'home' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </button>
          
          <button
            onClick={() => setCurrentView('users')}
            className={`flex flex-col items-center gap-1 p-2 ${
              currentView === 'users' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">Users</span>
          </button>
          
          <button
            onClick={() => setCurrentView('clinics')}
            className={`flex flex-col items-center gap-1 p-2 ${
              currentView === 'clinics' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <Building className="w-5 h-5" />
            <span className="text-xs">Clinics</span>
          </button>
          
          <button
            onClick={() => setCurrentView('content')}
            className={`flex flex-col items-center gap-1 p-2 ${
              currentView === 'content' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Content</span>
          </button>
          
          <button
            onClick={() => setCurrentView('profile')}
            className={`flex flex-col items-center gap-1 p-2 ${
              currentView === 'profile' ? 'text-blue-500' : 'text-gray-500'
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

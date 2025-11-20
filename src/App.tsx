import { useState, useEffect } from 'react';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { MotherDashboard } from './components/mother/MotherDashboard';
import { ClinicDashboard } from './components/clinic/ClinicDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Toaster } from './components/ui/sonner';
import { authAPI } from './utils/api';

export type UserRole = 'mother' | 'clinic' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  location?: string;
  pregnancyStage?: string;
  lmp?: string;
  dueDate?: string;
  hasBaby?: boolean;
}

function App() {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { user, session } = await authAPI.getSession();
        if (user && session) {
          setCurrentUser(user);
          setCurrentView('dashboard');
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleRegister = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
      setCurrentView('login');
    }
  };

  const switchToRegister = () => setCurrentView('register');
  const switchToLogin = () => setCurrentView('login');

  // Show loading state while checking session
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
        <Toaster />
      </div>
    );
  }

  if (currentView === 'register') {
    return (
      <>
        <Register onRegister={handleRegister} onSwitchToLogin={switchToLogin} />
        <Toaster />
      </>
    );
  }

  if (currentView === 'login') {
    return (
      <>
        <Login onLogin={handleLogin} onSwitchToRegister={switchToRegister} />
        <Toaster />
      </>
    );
  }

  if (currentView === 'dashboard' && currentUser) {
    if (currentUser.role === 'mother') {
      return (
        <>
          <MotherDashboard user={currentUser} onLogout={handleLogout} />
          <Toaster />
        </>
      );
    }
    if (currentUser.role === 'clinic') {
      return (
        <>
          <ClinicDashboard user={currentUser} onLogout={handleLogout} />
          <Toaster />
        </>
      );
    }
    if (currentUser.role === 'admin') {
      return (
        <>
          <AdminDashboard user={currentUser} onLogout={handleLogout} />
          <Toaster />
        </>
      );
    }
  }

  return (
    <>
      <Login onLogin={handleLogin} onSwitchToRegister={switchToRegister} />
      <Toaster />
    </>
  );
}

export default App;
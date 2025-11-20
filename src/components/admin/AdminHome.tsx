import { Bell, Users, Building, TrendingUp, Activity, AlertCircle, CheckCircle, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { MakeAdminSetup } from './MakeAdminSetup';
import type { User } from '../../App';

type AdminView = 'home' | 'users' | 'clinics' | 'content' | 'profile';

interface AdminHomeProps {
  user: User;
  onNavigate: React.Dispatch<React.SetStateAction<AdminView>>;
}


export function AdminHome({ user, onNavigate }: AdminHomeProps) {
  const stats = {
    totalUsers: 1234,
    activeMothers: 892,
    registeredClinics: 45,
    pendingApprovals: 7,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90">Welcome back,</p>
            <h1 className="text-xl">{user.name}</h1>
            <p className="text-sm opacity-75">System Administrator</p>
          </div>
          <button className="relative p-2 bg-white/20 rounded-full">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white/95 backdrop-blur">
            <CardContent className="p-3 text-center">
              <Users className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <div className="text-blue-500">{stats.totalUsers}</div>
              <div className="text-xs text-gray-600">Total Users</div>
            </CardContent>
          </Card>
          <Card className="bg-white/95 backdrop-blur">
            <CardContent className="p-3 text-center">
              <Building className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <div className="text-blue-500">{stats.registeredClinics}</div>
              <div className="text-xs text-gray-600">Clinics</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Admin Setup */}
        <MakeAdminSetup />

        {/* Pending Approvals */}
        {stats.pendingApprovals > 0 && (
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm mb-1">Pending Approvals</h3>
                  <p className="text-xs text-gray-600 mb-2">
                    {stats.pendingApprovals} clinic registrations awaiting approval
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-orange-600 border-orange-600"
                    onClick={() => onNavigate('clinics')}
                  >
                    Review Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Active Mothers</span>
                  <span className="text-sm">{stats.activeMothers}/{stats.totalUsers}</span>
                </div>
                <Progress value={(stats.activeMothers / stats.totalUsers) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Clinic Coverage</span>
                  <span className="text-sm">{stats.registeredClinics}/50</span>
                </div>
                <Progress value={(stats.registeredClinics / 50) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Content Library</span>
                  <span className="text-sm">120/200</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2 border-l-4 border-green-500 bg-green-50 rounded">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">Remera Clinic approved</p>
                  <p className="text-xs text-gray-600">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 border-l-4 border-blue-500 bg-blue-50 rounded">
                <Users className="w-4 h-4 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">45 new user registrations</p>
                  <p className="text-xs text-gray-600">Today</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 border-l-4 border-purple-500 bg-purple-50 rounded">
                <TrendingUp className="w-4 h-4 text-purple-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">System usage up 23%</p>
                  <p className="text-xs text-gray-600">This week</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('users')}>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm">Manage Users</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('clinics')}>
            <CardContent className="p-4 text-center">
              <Building className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm">Manage Clinics</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('content')}>
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm">Manage Content</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-sm">View Reports</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
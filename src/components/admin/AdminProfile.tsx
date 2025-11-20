import { Mail, LogOut, Settings, Shield, Database, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback } from '../ui/avatar';
import type { User } from '../../App';

interface AdminProfileProps {
  user: User;
  onLogout: () => void;
}

export function AdminProfile({ user, onLogout }: AdminProfileProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-500 text-white p-6 rounded-b-3xl">
        <div className="text-center">
          <Avatar className="h-24 w-24 mx-auto mb-3 border-4 border-white">
            <AvatarFallback className="bg-blue-300 text-white text-2xl">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-xl mb-1">{user.name}</h1>
          <p className="text-sm opacity-90">System Administrator</p>
        </div>
      </div>

      <div className="p-4 space-y-4 -mt-6">
        {/* Admin Information */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{user.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardContent className="p-0">
            <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
              <span className="flex-1 text-left text-sm">System Settings</span>
            </button>
            <Separator />
            <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
              <Shield className="w-5 h-5 text-gray-600" />
              <span className="flex-1 text-left text-sm">Security & Privacy</span>
            </button>
            <Separator />
            <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
              <Database className="w-5 h-5 text-gray-600" />
              <span className="flex-1 text-left text-sm">Database Backups</span>
            </button>
            <Separator />
            <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="flex-1 text-left text-sm">System Reports</span>
            </button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>

        <p className="text-center text-xs text-gray-500 pb-4">
          Version 1.0.0 • System Administrator Panel
        </p>
      </div>
    </div>
  );
}

import { User, MapPin, Phone, Mail, Calendar, Edit, LogOut, Settings, Bell, HelpCircle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import type { User as UserType } from '../../App';

interface ProfileProps {
  user: UserType;
  onLogout: () => void;
}

export function Profile({ user, onLogout }: ProfileProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-pink-500 text-white p-6 rounded-b-3xl">
        <div className="text-center">
          <Avatar className="h-24 w-24 mx-auto mb-3 border-4 border-white">
            <AvatarFallback className="bg-pink-300 text-white text-2xl">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-xl mb-1">{user.name}</h1>
          <p className="text-sm opacity-90">Week {user.pregnancyStage}</p>
        </div>
      </div>

      <div className="p-4 space-y-4 -mt-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{user.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{user.location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">Due Date: {user.dueDate}</span>
            </div>
          </CardContent>
        </Card>

        {/* Pregnancy Details */}
        <Card>
          <CardHeader>
            <CardTitle>Pregnancy Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Last Menstrual Period</span>
              <span className="text-gray-900">{user.lmp}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Expected Due Date</span>
              <span className="text-gray-900">{user.dueDate}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Week</span>
              <span className="text-gray-900">{user.pregnancyStage}</span>
            </div>
          </CardContent>
        </Card>

        {/* Settings & Options */}
        <Card>
          <CardContent className="p-0">
            <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
              <span className="flex-1 text-left text-sm">Settings</span>
            </button>
            <Separator />
            <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="flex-1 text-left text-sm">Notification Preferences</span>
            </button>
            <Separator />
            <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
              <Shield className="w-5 h-5 text-gray-600" />
              <span className="flex-1 text-left text-sm">Privacy & Security</span>
            </button>
            <Separator />
            <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
              <HelpCircle className="w-5 h-5 text-gray-600" />
              <span className="flex-1 text-left text-sm">Help & Support</span>
            </button>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>

        <p className="text-center text-xs text-gray-500 pb-4">
          Version 1.0.0 • Made with ❤️ for mothers
        </p>
      </div>
    </div>
  );
}

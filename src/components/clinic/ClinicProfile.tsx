import { MapPin, Phone, Mail, Building, LogOut, Settings, Users, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import type { User } from '../../App';

interface ClinicProfileProps {
  user: User;
  onLogout: () => void;
}

export function ClinicProfile({ user, onLogout }: ClinicProfileProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-500 text-white p-6 rounded-b-3xl">
        <div className="text-center">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Building className="w-12 h-12" />
          </div>
          <h1 className="text-xl mb-1">{user.name}</h1>
          <p className="text-sm opacity-90">{user.location}</p>
        </div>
      </div>

      <div className="p-4 space-y-4 -mt-6">
        {/* Clinic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Clinic Information</CardTitle>
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
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Users className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                <div>234</div>
                <div className="text-xs text-gray-600">Total Patients</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <BarChart className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                <div>87</div>
                <div className="text-xs text-gray-600">This Month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardContent className="p-0">
            <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
              <span className="flex-1 text-left text-sm">Clinic Settings</span>
            </button>
            <Separator />
            <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="flex-1 text-left text-sm">Staff Management</span>
            </button>
            <Separator />
            <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
              <BarChart className="w-5 h-5 text-gray-600" />
              <span className="flex-1 text-left text-sm">Reports & Analytics</span>
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
          Version 1.0.0
        </p>
      </div>
    </div>
  );
}

import { Bell, Users, Calendar, AlertTriangle, TrendingUp, Clock, MessageCircle } from 'lucide-react';import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import type { User } from '../../App';

interface ClinicHomeProps {
  user: User;
  onNavigate: (view: string) => void;
}

export function ClinicHome({ user, onNavigate }: ClinicHomeProps) {
  const stats = {
    totalPatients: 234,
    todayAppointments: 12,
    pendingRequests: 5,
    highRiskPatients: 8,
  };

  const upcomingAppointments = [
    { id: '1', patient: 'Marie Uwase', time: '9:00 AM', type: 'Antenatal', risk: 'low' },
    { id: '2', patient: 'Grace Mukamana', time: '10:00 AM', type: 'Ultrasound', risk: 'normal' },
    { id: '3', patient: 'Peace Niyonzima', time: '11:00 AM', type: 'Checkup', risk: 'high' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-purple-500 text-white p-4 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90">Welcome back,</p>
            <h1 className="text-xl">{user.name}</h1>
            <p className="text-sm opacity-75">{user.location}</p>
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
              <div className="text-purple-500">234</div>
              <div className="text-xs text-gray-600">Total Patients</div>
            </CardContent>
          </Card>
          <Card className="bg-white/95 backdrop-blur">
            <CardContent className="p-3 text-center">
              <div className="text-purple-500">12</div>
              <div className="text-xs text-gray-600">Today's Appointments</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Alerts */}
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm mb-1">High Risk Patients</h3>
                <p className="text-xs text-gray-600 mb-2">
                  {stats.highRiskPatients} patients require immediate attention
                </p>
                <Button size="sm" variant="outline" className="text-orange-600 border-orange-600">
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                Today's Schedule
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('appointments')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-purple-100 text-purple-600 px-3 py-2 rounded text-center min-w-[60px]">
                    <div className="text-xs">{apt.time}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{apt.patient}</p>
                      {apt.risk === 'high' && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                          High Risk
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{apt.type}</p>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              Pending Requests ({stats.pendingRequests})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <div>
                  <p className="text-sm">New appointment request</p>
                  <p className="text-xs text-gray-600">Sarah Mutoni - Ultrasound</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs">
                    Decline
                  </Button>
                  <Button size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700">
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('patients')}>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm">Patient Records</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm">Reports</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('messages')}>
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm">Send Broadcast</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-sm">Schedule</p>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>This Month's Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span className="text-gray-600">Appointments</span>
                  <span>87/100</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span className="text-gray-600">New Patients</span>
                  <span>23/30</span>
                </div>
                <Progress value={76} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span className="text-gray-600">Vaccinations</span>
                  <span>45/50</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Bell, Calendar, Heart, Baby, Phone, MapPin, AlertCircle, BookOpen, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import type { User } from '../../App';

interface MotherHomeProps {
  user: User;
  onNavigate: (view: string) => void;
}

export function MotherHome({ user, onNavigate }: MotherHomeProps) {
  const calculateWeeksPregnant = () => {
    if (!user.lmp) return 0;
    const lmpDate = new Date(user.lmp);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lmpDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  };

  const weeksPregnant = calculateWeeksPregnant();
  const progressPercent = (weeksPregnant / 40) * 100;
  const daysUntilDue = user.dueDate ? Math.ceil((new Date(user.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <div className="bg-pink-500 text-white p-4 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90">Welcome back,</p>
            <h1 className="text-xl">{user.name}</h1>
          </div>
          <button
            onClick={() => onNavigate('notifications')}
            className="relative p-2 bg-white/20 rounded-full"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Pregnancy Progress */}
        <Card className="bg-white/95 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" fill="currentColor" />
                <span className="text-gray-700">Week {weeksPregnant} of 40</span>
              </div>
              <span className="text-sm text-gray-600">{daysUntilDue} days to go</span>
            </div>
            <Progress value={progressPercent} className="h-2 mb-2" />
            <p className="text-xs text-gray-600">Due Date: {user.dueDate || 'Not set'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 space-y-4">
        {/* Emergency Button */}
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-red-800">Need urgent help?</span>
            <Button size="sm" className="bg-red-600 hover:bg-red-700">
              <Phone className="w-4 h-4 mr-1" />
              Emergency
            </Button>
          </AlertDescription>
        </Alert>

        {/* This Week's Development */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="w-5 h-5 text-pink-500" />
              Week {weeksPregnant} Development
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Your baby is about the size of a {weeksPregnant < 20 ? 'lemon' : weeksPregnant < 30 ? 'coconut' : 'pineapple'}! 
              {' '}Major organs are continuing to develop and your baby is getting stronger each day.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('tracker')}
              className="w-full"
            >
              View Full Details
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pink-500" />
                Next Appointment
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
              <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg">
                <div className="bg-pink-500 text-white p-2 rounded-lg text-center min-w-[50px]">
                  <div className="text-xs">Nov</div>
                  <div>15</div>
                </div>
                <div className="flex-1">
                  <p className="text-sm">Antenatal Checkup</p>
                  <p className="text-xs text-gray-600">Kigali Health Center</p>
                  <p className="text-xs text-gray-600">10:00 AM</p>
                </div>
                <Button size="sm" variant="outline">Reschedule</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('appointments')}>
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 text-pink-500 mx-auto mb-2" />
              <p className="text-sm">Book Appointment</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('education')}>
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm">Learn More</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('chat')}>
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm">Chat with Doctor</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <MapPin className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm">Nearby Clinics</p>
            </CardContent>
          </Card>
        </div>

        {/* Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-pink-500" />
              Today's Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <p className="text-sm flex-1">Take prenatal vitamins</p>
                <span className="text-xs text-gray-600">9:00 AM</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm flex-1">Drink 8 glasses of water</p>
                <span className="text-xs text-gray-600">All day</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

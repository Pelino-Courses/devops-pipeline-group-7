import { ArrowLeft, Bell, Calendar, Pill, Heart, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import type { User } from '../../App';

interface NotificationsProps {
  user: User;
}

const mockNotifications = [
  {
    id: '1',
    type: 'appointment',
    title: 'Upcoming Appointment',
    message: 'You have an antenatal checkup tomorrow at 10:00 AM',
    time: '2 hours ago',
    read: false,
    icon: Calendar,
    color: 'text-blue-500',
  },
  {
    id: '2',
    type: 'medication',
    title: 'Medication Reminder',
    message: 'Time to take your prenatal vitamins',
    time: '3 hours ago',
    read: false,
    icon: Pill,
    color: 'text-green-500',
  },
  {
    id: '3',
    type: 'health',
    title: 'Health Tip',
    message: 'Remember to stay hydrated! Drink at least 8 glasses of water today.',
    time: '5 hours ago',
    read: true,
    icon: Heart,
    color: 'text-pink-500',
  },
  {
    id: '4',
    type: 'alert',
    title: 'Test Results Available',
    message: 'Your recent blood test results are now available',
    time: 'Yesterday',
    read: true,
    icon: AlertCircle,
    color: 'text-orange-500',
  },
  {
    id: '5',
    type: 'appointment',
    title: 'Appointment Confirmed',
    message: 'Your ultrasound scan on Nov 22 has been confirmed',
    time: '2 days ago',
    read: true,
    icon: Calendar,
    color: 'text-blue-500',
  },
];

export function Notifications({ user }: NotificationsProps) {
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-pink-500 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <ArrowLeft className="w-6 h-6" />
            <h1>Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-white text-pink-500">
              {unreadCount} new
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-2">
            {mockNotifications.map(notification => {
              const Icon = notification.icon;
              return (
                <Card
                  key={notification.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    !notification.read ? 'bg-pink-50 border-l-4 border-pink-500' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-full bg-gray-100 h-fit`}>
                        <Icon className={`w-5 h-5 ${notification.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="text-sm">{notification.title}</h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="unread" className="space-y-2">
            {mockNotifications
              .filter(n => !n.read)
              .map(notification => {
                const Icon = notification.icon;
                return (
                  <Card
                    key={notification.id}
                    className="cursor-pointer hover:shadow-md transition-shadow bg-pink-50 border-l-4 border-pink-500"
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-full bg-white h-fit`}>
                          <Icon className={`w-5 h-5 ${notification.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-sm">{notification.title}</h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                        </div>
                        <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </TabsContent>

          <TabsContent value="read" className="space-y-2">
            {mockNotifications
              .filter(n => n.read)
              .map(notification => {
                const Icon = notification.icon;
                return (
                  <Card
                    key={notification.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-full bg-gray-100 h-fit`}>
                          <Icon className={`w-5 h-5 ${notification.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-sm">{notification.title}</h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

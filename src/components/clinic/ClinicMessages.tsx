import { useState } from 'react';
import { ArrowLeft, Send, Users, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import type { User } from '../../App';

interface ClinicMessagesProps {
  user: User;
}

export function ClinicMessages({ user }: ClinicMessagesProps) {
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const handleSendBroadcast = () => {
    // In real app, send broadcast to all patients
    setBroadcastMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-500 text-white p-4">
        <div className="flex items-center gap-3 mb-4">
          <ArrowLeft className="w-6 h-6" />
          <h1>Messages</h1>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="broadcast" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
            <TabsTrigger value="individual">Individual</TabsTrigger>
          </TabsList>

          <TabsContent value="broadcast" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  Send Broadcast Message
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Message Title</Label>
                  <Input id="title" placeholder="e.g., Free Antenatal Clinic" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your message here..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    rows={5}
                  />
                  <p className="text-xs text-gray-500">
                    This message will be sent to all registered mothers
                  </p>
                </div>

                <Button
                  onClick={handleSendBroadcast}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send to All Patients
                </Button>
              </CardContent>
            </Card>

            {/* Recent Broadcasts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Broadcasts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm">Free Vaccination Campaign</h4>
                    <span className="text-xs text-gray-500">2 days ago</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Free tetanus vaccinations available this Friday from 9 AM to 3 PM. No appointment needed.
                  </p>
                  <div className="mt-2 text-xs text-purple-600">
                    Sent to 234 patients
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm">Nutrition Workshop</h4>
                    <span className="text-xs text-gray-500">1 week ago</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Join our nutrition workshop for pregnant mothers this Saturday at 10 AM.
                  </p>
                  <div className="mt-2 text-xs text-purple-600">
                    Sent to 234 patients
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="individual" className="space-y-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">MU</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm">Marie Uwase</h4>
                    <p className="text-xs text-gray-600">Your appointment is confirmed...</p>
                  </div>
                  <span className="text-xs text-gray-500">10:30 AM</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">GM</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm">Grace Mukamana</h4>
                    <p className="text-xs text-gray-600">Thanks for the reminder!</p>
                  </div>
                  <span className="text-xs text-gray-500">Yesterday</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

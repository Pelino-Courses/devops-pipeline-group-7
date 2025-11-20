import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import type { User } from '../../App';

interface ClinicAppointmentsProps {
  user: User;
}

const mockAppointments = [
  {
    id: '1',
    patient: 'Marie Uwase',
    type: 'Antenatal Checkup',
    date: '2024-11-15',
    time: '9:00 AM',
    status: 'confirmed',
    notes: 'Regular checkup',
  },
  {
    id: '2',
    patient: 'Grace Mukamana',
    type: 'Ultrasound',
    date: '2024-11-15',
    time: '10:00 AM',
    status: 'pending',
    notes: '20-week scan',
  },
  {
    id: '3',
    patient: 'Peace Niyonzima',
    type: 'High Risk Consultation',
    date: '2024-11-15',
    time: '11:00 AM',
    status: 'confirmed',
    notes: 'Follow-up on blood pressure',
  },
  {
    id: '4',
    patient: 'Sarah Mutoni',
    type: 'General Checkup',
    date: '2024-11-16',
    time: '2:00 PM',
    status: 'pending',
    notes: 'First trimester checkup',
  },
];

export function ClinicAppointments({ user }: ClinicAppointmentsProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-500 text-white p-4">
        <div className="flex items-center gap-3 mb-4">
          <ArrowLeft className="w-6 h-6" />
          <h1>Appointments</h1>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-3">
            {mockAppointments
              .filter(apt => apt.status === 'confirmed')
              .map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-sm mb-1">{appointment.patient}</h3>
                        <p className="text-xs text-gray-600">{appointment.type}</p>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>

                    <div className="flex items-center gap-4 mb-3 p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-4 h-4 text-gray-600" />
                        {appointment.time}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mb-3">Notes: {appointment.notes}</p>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Reschedule
                      </Button>
                      <Button size="sm" className="flex-1 bg-purple-500 hover:bg-purple-600">
                        Start Consultation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-3">
            {mockAppointments
              .filter(apt => apt.status === 'pending')
              .map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-sm mb-1">{appointment.patient}</h3>
                        <p className="text-xs text-gray-600">{appointment.type}</p>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>

                    <div className="flex items-center gap-4 mb-3 p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-4 h-4 text-gray-600" />
                        {appointment.time}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mb-3">Notes: {appointment.notes}</p>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200">
                        <XCircle className="w-3 h-3 mr-1" />
                        Decline
                      </Button>
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm mb-1">Divine Uwera</h3>
                    <p className="text-xs text-gray-600">Antenatal Checkup</p>
                  </div>
                  <Badge className="bg-gray-200 text-gray-700">Completed</Badge>
                </div>

                <div className="flex items-center gap-4 p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    Oct 28
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="w-4 h-4 text-gray-600" />
                    9:00 AM
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

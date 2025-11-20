import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Plus, Video, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { appointmentsAPI, clinicAPI } from '../../utils/api';
import { toast } from 'sonner@2.0.3';
import type { User } from '../../App';

interface AppointmentsProps {
  user: User;
}

export function Appointments({ user }: AppointmentsProps) {
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [appointmentReason, setAppointmentReason] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, clinicsRes] = await Promise.all([
        appointmentsAPI.getAll(),
        clinicAPI.getAll(),
      ]);
      setAppointments(appointmentsRes.appointments || []);
      setClinics(clinicsRes.clinics || []);
    } catch (error: any) {
      console.error('Load data error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedClinic || !appointmentType || !appointmentDate || !appointmentTime) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setBookingLoading(true);
      await appointmentsAPI.create({
        clinicId: selectedClinic,
        date: appointmentDate,
        time: appointmentTime,
        reason: appointmentReason || appointmentType,
        type: appointmentType,
      });
      
      toast.success('Appointment booked successfully!');
      setShowBookDialog(false);
      
      // Reset form
      setSelectedClinic('');
      setAppointmentType('');
      setAppointmentReason('');
      setAppointmentDate('');
      setAppointmentTime('');
      
      // Reload appointments
      await loadData();
    } catch (error: any) {
      console.error('Book appointment error:', error);
      toast.error(error.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await appointmentsAPI.delete(id);
      toast.success('Appointment cancelled');
      await loadData();
    } catch (error: any) {
      console.error('Delete appointment error:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate >= today && apt.status !== 'completed' && apt.status !== 'cancelled';
  });

  const pastAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate < today || apt.status === 'completed' || apt.status === 'cancelled';
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-pink-500 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ArrowLeft className="w-6 h-6" />
            <h1>Appointments</h1>
          </div>
          <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-white text-pink-500 hover:bg-pink-50">
                <Plus className="w-4 h-4 mr-1" />
                Book
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Book Appointment</DialogTitle>
                <DialogDescription>
                  Schedule a visit with your healthcare provider
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="clinic">Select Clinic</Label>
                  <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                    <SelectTrigger id="clinic">
                      <SelectValue placeholder="Choose a clinic" />
                    </SelectTrigger>
                    <SelectContent>
                      {clinics.map(clinic => (
                        <SelectItem key={clinic.id} value={clinic.id}>
                          {clinic.name} - {clinic.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Appointment Type</Label>
                  <Select value={appointmentType} onValueChange={setAppointmentType}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Choose type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="antenatal">Antenatal Checkup</SelectItem>
                      <SelectItem value="ultrasound">Ultrasound Scan</SelectItem>
                      <SelectItem value="consultation">General Consultation</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                      <SelectItem value="postnatal">Postnatal Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Textarea
                    id="reason"
                    placeholder="Describe your concerns..."
                    value={appointmentReason}
                    onChange={(e) => setAppointmentReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Preferred Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Preferred Time</Label>
                  <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                    <SelectTrigger id="time">
                      <SelectValue placeholder="Choose time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleBookAppointment} 
                  className="w-full bg-pink-500 hover:bg-pink-600"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-gray-600">Loading appointments...</div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-600">No upcoming appointments</div>
            ) : (
              upcomingAppointments.map(appointment => {
                const clinic = clinics.find(c => c.id === appointment.clinicId);
                return (
                  <Card key={appointment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-sm mb-1">{appointment.type}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                            <MapPin className="w-3 h-3" />
                            {clinic?.name || 'Unknown Clinic'}
                          </div>
                          {appointment.reason && (
                            <div className="text-xs text-gray-600 mt-1">{appointment.reason}</div>
                          )}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {appointment.status || 'Pending'}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-3 p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          {new Date(appointment.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="w-4 h-4 text-gray-600" />
                          {appointment.time}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleDeleteAppointment(appointment.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-gray-600">Loading appointments...</div>
            ) : pastAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-600">No past appointments</div>
            ) : (
              pastAppointments.map(appointment => {
                const clinic = clinics.find(c => c.id === appointment.clinicId);
                return (
                  <Card key={appointment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-sm mb-1">{appointment.type}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                            <MapPin className="w-3 h-3" />
                            {clinic?.name || 'Unknown Clinic'}
                          </div>
                          {appointment.notes && (
                            <div className="text-xs text-gray-600 mt-1">Notes: {appointment.notes}</div>
                          )}
                        </div>
                        <div className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                          {appointment.status || 'Completed'}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          {new Date(appointment.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="w-4 h-4 text-gray-600" />
                          {appointment.time}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Nearby Clinics */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-pink-500" />
              Nearby Clinics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clinics.map(clinic => (
                <div key={clinic.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <h4 className="text-sm mb-1">{clinic.name}</h4>
                    <p className="text-xs text-gray-600 mb-1">{clinic.location}</p>
                    {clinic.phone && (
                      <p className="text-xs text-pink-500">{clinic.phone}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {clinic.phone && (
                      <Button size="sm" variant="outline" className="h-8">
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
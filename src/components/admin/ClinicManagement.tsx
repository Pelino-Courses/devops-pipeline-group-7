import { useState } from 'react';
import { ArrowLeft, Search, CheckCircle, XCircle, MapPin, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const mockClinics = [
  {
    id: '1',
    name: 'Kigali Health Center',
    email: 'kigali.health@example.com',
    phone: '+250 788 111 222',
    location: 'Gasabo District, Kigali',
    status: 'approved',
    registeredDate: '2024-09-15',
    patients: 234,
  },
  {
    id: '2',
    name: 'Nyarugenge Hospital',
    email: 'nyarugenge@example.com',
    phone: '+250 788 222 333',
    location: 'Nyarugenge District, Kigali',
    status: 'approved',
    registeredDate: '2024-08-20',
    patients: 456,
  },
  {
    id: '3',
    name: 'Remera Clinic',
    email: 'remera@example.com',
    phone: '+250 788 333 444',
    location: 'Gasabo District, Kigali',
    status: 'pending',
    registeredDate: '2024-11-01',
    patients: 0,
  },
];

export function ClinicManagement() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClinics = mockClinics.filter(clinic =>
    clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clinic.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4">
        <div className="flex items-center gap-3 mb-4">
          <ArrowLeft className="w-6 h-6" />
          <h1>Clinic Management</h1>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search clinics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>

        <Badge className="bg-white/20">{filteredClinics.length} Clinics</Badge>
      </div>

      <div className="p-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {filteredClinics.map((clinic) => (
              <Card key={clinic.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm mb-1">{clinic.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <MapPin className="w-3 h-3" />
                        {clinic.location}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Phone className="w-3 h-3" />
                        {clinic.phone}
                      </div>
                    </div>
                    {getStatusBadge(clinic.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">Patients</div>
                      <div>{clinic.patients}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">Registered</div>
                      <div>{new Date(clinic.registeredDate).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {clinic.status === 'pending' ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200">
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full">
                      View Details
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="approved" className="space-y-3">
            {filteredClinics
              .filter(c => c.status === 'approved')
              .map((clinic) => (
                <Card key={clinic.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-sm mb-1">{clinic.name}</h3>
                        <p className="text-xs text-gray-600">{clinic.location}</p>
                        <p className="text-xs text-gray-600">{clinic.patients} patients</p>
                      </div>
                      {getStatusBadge(clinic.status)}
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-3">
            {filteredClinics
              .filter(c => c.status === 'pending')
              .map((clinic) => (
                <Card key={clinic.id} className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-sm mb-1">{clinic.name}</h3>
                        <p className="text-xs text-gray-600">{clinic.location}</p>
                        <p className="text-xs text-gray-600">{clinic.email}</p>
                      </div>
                      {getStatusBadge(clinic.status)}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200">
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
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
        </Tabs>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ArrowLeft, Search, Filter, AlertCircle, Calendar, Phone } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import type { User } from '../../App';

interface PatientListProps {
  user: User;
}

const mockPatients = [
  {
    id: '1',
    name: 'Marie Uwase',
    age: 28,
    phone: '+250 788 123 456',
    location: 'Kigali',
    weeks: 24,
    dueDate: '2025-02-05',
    risk: 'low',
    nextVisit: '2024-11-15',
  },
  {
    id: '2',
    name: 'Grace Mukamana',
    age: 32,
    phone: '+250 788 234 567',
    location: 'Gasabo',
    weeks: 18,
    dueDate: '2025-03-20',
    risk: 'normal',
    nextVisit: '2024-11-18',
  },
  {
    id: '3',
    name: 'Peace Niyonzima',
    age: 35,
    phone: '+250 788 345 678',
    location: 'Nyarugenge',
    weeks: 32,
    dueDate: '2024-12-10',
    risk: 'high',
    nextVisit: '2024-11-12',
  },
  {
    id: '4',
    name: 'Sarah Mutoni',
    age: 26,
    phone: '+250 788 456 789',
    location: 'Kicukiro',
    weeks: 12,
    dueDate: '2025-05-01',
    risk: 'low',
    nextVisit: '2024-11-25',
  },
];

export function PatientList({ user }: PatientListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<typeof mockPatients[0] | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'normal':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const handleViewDetails = (patient: typeof mockPatients[0]) => {
    setSelectedPatient(patient);
    setShowDetails(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-500 text-white p-4">
        <div className="flex items-center gap-3 mb-4">
          <ArrowLeft className="w-6 h-6" />
          <h1>Patient Records</h1>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="bg-white/10 text-white border-white/30">
            <Filter className="w-4 h-4 mr-1" />
            Filter
          </Button>
          <Badge className="bg-white/20">{filteredPatients.length} Patients</Badge>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="low">Low Risk</TabsTrigger>
            <TabsTrigger value="normal">Normal</TabsTrigger>
            <TabsTrigger value="high">High Risk</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {filteredPatients.map((patient) => (
              <Card key={patient.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm">{patient.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {patient.age} yrs
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{patient.location}</p>
                    </div>
                    <Badge className={`text-xs ${getRiskColor(patient.risk)}`}>
                      {patient.risk === 'low' ? 'Low Risk' : patient.risk === 'normal' ? 'Normal' : 'High Risk'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">Pregnancy Week</div>
                      <div>{patient.weeks} weeks</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">Due Date</div>
                      <div>{new Date(patient.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleViewDetails(patient)}
                    >
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1 bg-purple-500 hover:bg-purple-600">
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="low" className="space-y-3">
            {filteredPatients.filter(p => p.risk === 'low').map((patient) => (
              <Card key={patient.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm mb-1">{patient.name}</h3>
                      <p className="text-xs text-gray-600">{patient.location}</p>
                    </div>
                    <Badge className="text-xs bg-green-100 text-green-700">Low Risk</Badge>
                  </div>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => handleViewDetails(patient)}>
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="normal" className="space-y-3">
            {filteredPatients.filter(p => p.risk === 'normal').map((patient) => (
              <Card key={patient.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm mb-1">{patient.name}</h3>
                      <p className="text-xs text-gray-600">{patient.location}</p>
                    </div>
                    <Badge className="text-xs bg-yellow-100 text-yellow-700">Normal</Badge>
                  </div>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => handleViewDetails(patient)}>
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="high" className="space-y-3">
            {filteredPatients.filter(p => p.risk === 'high').map((patient) => (
              <Card key={patient.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm mb-1">{patient.name}</h3>
                      <p className="text-xs text-gray-600">{patient.location}</p>
                    </div>
                    <Badge className="text-xs bg-red-100 text-red-700">High Risk</Badge>
                  </div>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => handleViewDetails(patient)}>
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Patient Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>Complete pregnancy and health information</DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3>{selectedPatient.name}</h3>
                  <p className="text-sm text-gray-600">{selectedPatient.age} years old</p>
                </div>
                <Badge className={getRiskColor(selectedPatient.risk)}>
                  {selectedPatient.risk === 'low' ? 'Low Risk' : selectedPatient.risk === 'normal' ? 'Normal' : 'High Risk'}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span>{selectedPatient.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span>{selectedPatient.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pregnancy Week:</span>
                  <span>{selectedPatient.weeks} weeks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span>{selectedPatient.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Visit:</span>
                  <span>{selectedPatient.nextVisit}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-purple-500 hover:bg-purple-600">
                  <Phone className="w-4 h-4 mr-1" />
                  Call Patient
                </Button>
                <Button variant="outline" className="flex-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  Schedule
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

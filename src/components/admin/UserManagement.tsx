import { useState } from 'react';
import { ArrowLeft, Search, Filter, MoreVertical, UserX, UserCheck, UserPlus } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { adminAPI } from '../../utils/api';
import { toast } from 'sonner';

const mockUsers = [
  {
    id: '1',
    name: 'Marie Uwase',
    email: 'marie@example.com',
    role: 'mother',
    status: 'active',
    location: 'Kigali',
    joinedDate: '2024-10-01',
  },
  {
    id: '2',
    name: 'Kigali Health Center',
    email: 'kigali.health@example.com',
    role: 'clinic',
    status: 'active',
    location: 'Kigali',
    joinedDate: '2024-09-15',
  },
  {
    id: '3',
    name: 'Grace Mukamana',
    email: 'grace@example.com',
    role: 'mother',
    status: 'active',
    location: 'Gasabo',
    joinedDate: '2024-10-15',
  },
  {
    id: '4',
    name: 'Peace Niyonzima',
    email: 'peace@example.com',
    role: 'mother',
    status: 'inactive',
    location: 'Nyarugenge',
    joinedDate: '2024-08-20',
  },
];

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'mother',
    phone: '',
    location: '',
    lmp: '',
  });

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminAPI.createUser(formData);
      toast.success(`${formData.role === 'mother' ? 'Mother' : formData.role === 'clinic' ? 'Clinic' : 'Admin'} account created successfully!`);
      setOpenDialog(false);
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'mother',
        phone: '',
        location: '',
        lmp: '',
      });
      // Optionally refresh the user list
    } catch (error: any) {
      console.error('Create user error:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'mother':
        return <Badge className="bg-pink-100 text-pink-700">Mother</Badge>;
      case 'clinic':
        return <Badge className="bg-purple-100 text-purple-700">Clinic</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-700">Active</Badge>
    ) : (
      <Badge className="bg-gray-200 text-gray-700">Inactive</Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4">
        <div className="flex items-center gap-3 mb-4">
          <ArrowLeft className="w-6 h-6" />
          <h1>User Management</h1>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search users..."
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
          <Badge className="bg-white/20">{filteredUsers.length} Users</Badge>
          
          {/* Add User Dialog Trigger */}
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-white text-blue-500 hover:bg-white/90">
                <UserPlus className="w-4 h-4 mr-1" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with a specific role (Mother, Clinic, or Admin).
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mother">Mother</SelectItem>
                      <SelectItem value="clinic">Clinic</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                {formData.role === 'mother' && (
                  <div className="space-y-2">
                    <Label htmlFor="lmp">Last Menstrual Period (Optional)</Label>
                    <Input
                      id="lmp"
                      type="date"
                      value={formData.lmp}
                      onChange={(e) => setFormData({ ...formData, lmp: e.target.value })}
                    />
                  </div>
                )}
                <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600" disabled={loading}>
                  {loading ? 'Creating User...' : 'Create User'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="mothers">Mothers</TabsTrigger>
            <TabsTrigger value="clinics">Clinics</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm">{user.name}</h3>
                        {getRoleBadge(user.role)}
                      </div>
                      <p className="text-xs text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-600">{user.location}</p>
                    </div>
                    {getStatusBadge(user.status)}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                    <span>Joined: {new Date(user.joinedDate).toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={user.status === 'active' ? 'text-red-600' : 'text-green-600'}
                    >
                      {user.status === 'active' ? (
                        <>
                          <UserX className="w-3 h-3 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3 h-3 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="mothers" className="space-y-3">
            {filteredUsers
              .filter(u => u.role === 'mother')
              .map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-sm mb-1">{user.name}</h3>
                        <p className="text-xs text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-600">{user.location}</p>
                      </div>
                      {getStatusBadge(user.status)}
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="clinics" className="space-y-3">
            {filteredUsers
              .filter(u => u.role === 'clinic')
              .map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-sm mb-1">{user.name}</h3>
                        <p className="text-xs text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-600">{user.location}</p>
                      </div>
                      {getStatusBadge(user.status)}
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
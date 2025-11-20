import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Heart, ArrowLeft } from 'lucide-react';
import { authAPI } from '../../utils/api';
import type { User, UserRole } from '../../App';

interface RegisterProps {
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void;
}

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('mother');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [lmp, setLmp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateDueDate = (lmpDate: string) => {
    const date = new Date(lmpDate);
    date.setDate(date.getDate() + 280); // 40 weeks
    return date.toISOString().split('T')[0];
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { user } = await authAPI.signup({
        email,
        password,
        name,
        role: selectedRole,
        phone,
        location,
        lmp: selectedRole === 'mother' ? lmp : undefined,
      });
      
      onRegister(user);
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Check if it's a duplicate email error
      if (err.message.includes('already been registered')) {
        setError('This email is already registered. Please use a different email or login instead.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={onSwitchToLogin}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
        
        <div className="flex items-center justify-center mb-6">
          <div className="bg-pink-500 p-4 rounded-full">
            <Heart className="w-8 h-8 text-white" fill="white" />
          </div>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Join our maternal care community</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="mother">Mother</TabsTrigger>
                <TabsTrigger value="clinic">Clinic</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedRole}>
                <form onSubmit={handleRegister} className="space-y-4 mt-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {selectedRole === 'mother' ? 'Full Name' : selectedRole === 'clinic' ? 'Clinic Name' : 'Admin Name'}
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+250 7XX XXX XXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="City, District"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  {selectedRole === 'mother' && (
                    <div className="space-y-2">
                      <Label htmlFor="lmp">Last Menstrual Period (Optional)</Label>
                      <Input
                        id="lmp"
                        type="date"
                        value={lmp}
                        onChange={(e) => setLmp(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-pink-500 hover:bg-pink-600"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
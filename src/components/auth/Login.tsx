import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Heart } from 'lucide-react';
import { authAPI } from '../../utils/api';
import type { User, UserRole } from '../../App';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
}

export function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('mother');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user } = await authAPI.login(email, password);

      // Verify role matches selected tab
      if (user.role !== selectedRole) {
        setError(`Please use the ${user.role} tab to login`);
        setLoading(false);
        return;
      }

      onLogin(user);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-pink-500 p-4 rounded-full">
            <Heart className="w-8 h-8 text-white" fill="white" />
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Maternal Care Support</CardTitle>
            <CardDescription>Supporting mothers every step of the way</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedRole} onValueChange={(value: string) => setSelectedRole(value as UserRole)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="mother">Mother</TabsTrigger>
                <TabsTrigger value="clinic">Clinic</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedRole}>
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email / Phone</Label>
                    <Input
                      id="email"
                      type="text"
                      placeholder="Enter email or phone"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-blue-600"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>

                  <div className="text-center space-y-2">
                    <button type="button" className="text-sm text-pink-600 hover:underline">
                      Forgot password?
                    </button>
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="text-pink-600 hover:underline"
                      >
                        Register
                      </button>
                    </p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500"> 
            Available in English & Kinyarwanda</p>
        </div>
      </div>
    </div>
  );
}
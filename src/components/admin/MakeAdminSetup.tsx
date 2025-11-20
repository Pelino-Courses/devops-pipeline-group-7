import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { adminAPI } from '../../utils/api';
import { toast } from 'sonner@2.0.3';
import { Shield, Check } from 'lucide-react';

export function MakeAdminSetup() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const makeAdmin = async () => {
    setLoading(true);
    try {
      await adminAPI.makeAdmin('nshimisamuel2020@gmail.com');
      toast.success('Successfully made nshimisamuel2020@gmail.com an admin!');
      setSuccess(true);
    } catch (error: any) {
      console.error('Make admin error:', error);
      toast.error(error.message || 'Failed to make admin');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-2 rounded-full">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-green-800">Admin setup complete!</p>
              <p className="text-sm text-green-700">nshimisamuel2020@gmail.com is now an admin.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Admin Setup
        </CardTitle>
        <CardDescription>
          Make nshimisamuel2020@gmail.com an admin account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={makeAdmin} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Processing...' : 'Make Admin'}
        </Button>
        <p className="text-xs text-gray-600 mt-2">
          Note: The account must be registered first before making it an admin.
        </p>
      </CardContent>
    </Card>
  );
}

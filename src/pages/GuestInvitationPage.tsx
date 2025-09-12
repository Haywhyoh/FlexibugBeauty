import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GuestClient {
  id: string;
  email: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  professional_id: string;
  invitation_expires_at: string;
  profiles?: {
    business_name: string | null;
    first_name: string | null;
    last_name: string | null;
  };
}

export default function GuestInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [guestClient, setGuestClient] = useState<GuestClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form data
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const validateInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        // Fetch guest client by invitation token
        const { data, error: fetchError } = await supabase
          .from('guest_clients')
          .select(`
            *,
            profiles!professional_id (
              business_name,
              first_name,
              last_name
            )
          `)
          .eq('invitation_token', token)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
          setError('Invalid or expired invitation');
          setLoading(false);
          return;
        }

        // Check if invitation has expired
        const expiryDate = new Date(data.invitation_expires_at);
        if (expiryDate < new Date()) {
          setError('This invitation has expired');
          setLoading(false);
          return;
        }

        // Check if already converted
        if (data.converted_to_user_id) {
          setError('This invitation has already been used');
          setLoading(false);
          return;
        }

        setGuestClient(data);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setPhone(data.phone || '');
        
      } catch (err: any) {
        console.error('Error validating invitation:', err);
        setError('Failed to validate invitation');
      } finally {
        setLoading(false);
      }
    };

    validateInvitation();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!guestClient) return;
    
    // Validate form
    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (!firstName.trim()) {
      toast({
        title: 'Error',
        description: 'First name is required',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: guestClient.email,
        password: password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            user_type: 'client'
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Update guest client record with conversion details
      const { error: updateError } = await supabase
        .from('guest_clients')
        .update({
          converted_to_user_id: authData.user.id,
          conversion_date: new Date().toISOString(),
          first_name: firstName,
          last_name: lastName || null,
          phone: phone || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', guestClient.id);

      if (updateError) {
        console.error('Error updating guest client:', updateError);
        // Don't fail the whole process for this
      }

      // Create client profile
      const { error: profileError } = await supabase
        .from('client_profiles')
        .insert({
          user_id: authData.user.id,
          professional_id: guestClient.professional_id,
          original_lead_id: null, // This wasn't from a lead
          client_since: new Date().toISOString(),
          notes: `Converted from guest client: ${guestClient.email}`
        });

      if (profileError) {
        console.error('Error creating client profile:', profileError);
        // Don't fail for this either
      }

      setSuccess(true);
      
      toast({
        title: 'Account Created! 🎉',
        description: 'Your account has been created successfully. Please check your email to verify your account.',
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/login?message=Please verify your email and then sign in');
      }, 3000);

    } catch (err: any) {
      console.error('Error creating account:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to create account',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Validating Invitation</h2>
            <p className="text-gray-600 text-center">Please wait while we validate your invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invitation</h2>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <Button onClick={() => navigate('/')}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-600 text-center mb-6">
              Your account has been created successfully. Please check your email to verify your account.
            </p>
            <p className="text-sm text-gray-500 text-center">
              Redirecting to login page in a few seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const professionalName = guestClient?.profiles?.business_name || 
    `${guestClient?.profiles?.first_name || ''} ${guestClient?.profiles?.last_name || ''}`.trim() ||
    'Beauty Professional';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <p className="text-gray-600 mt-2">
            You've been invited by <strong>{professionalName}</strong> to create an account
          </p>
        </CardHeader>
        
        <CardContent>
          <Alert className="mb-6">
            <AlertDescription>
              Email: <strong>{guestClient?.email}</strong>
              <br />
              Complete your registration to access your booking history and book future appointments.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
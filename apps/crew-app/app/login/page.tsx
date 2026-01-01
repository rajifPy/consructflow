// apps/crew-app/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@constructflow/shared-db';
import { Card, Button, Input, Alert } from '@constructflow/shared-ui';

interface UserProfile {
  id: string;
  full_name: string;
  role: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading) return;
    
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login for:', email);
      
      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }

      if (!data.user) {
        throw new Error('Login failed - no user data');
      }

      console.log('Sign in successful, user:', data.user.email);

      // Check if user has a profile with proper typing
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error('User profile not found. Please contact administrator.');
      }

      // Type guard to ensure profile exists and has required fields
      if (!profile || typeof profile !== 'object' || !('role' in profile)) {
        throw new Error('Invalid user profile. Please contact administrator.');
      }

      // Now TypeScript knows profile has the correct shape
      const userProfile = profile as UserProfile;
      console.log('Profile found:', userProfile.role);
      
      // Small delay to ensure auth state is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Redirecting to dashboard...');
      
      // Use replace to prevent back button returning to login
      router.replace('/');
      
    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
    } finally {
      // Always reset loading state
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ConstructFlow Crew
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <Card>
            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
                placeholder="your.email@example.com"
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
                placeholder="••••••••"
              />
            </div>

            <div className="mt-6">
              <Button 
                type="submit" 
                loading={loading} 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </Card>
        </form>

        <div className="text-center text-sm text-gray-600">
          <p>Demo Account:</p>
          <p className="mt-1 font-mono">crew-foreman@gmail.com</p>
          <p className="mt-2 text-xs">(Password: password123)</p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Typography } from '@/components/ui/typography';
import { useNavigate } from 'react-router-dom';

const SetupUsernamePage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { 
    setupUsername, 
    checkUsernameAvailability, 
    loading, 
    needsUsername, 
    error: authError, 
    clearError 
  } = useAuth();
  const navigate = useNavigate();

  // If user doesn't need username setup, redirect to dashboard
  useEffect(() => {
    if (!needsUsername) {
      navigate('/dashboard');
    }
    
    // Clear any auth errors when mounting component
    clearError();
  }, [needsUsername, navigate, clearError]);

  // Check username availability when user stops typing
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (username && username.length >= 3) {
        try {
          const available = await checkUsernameAvailability(username);
          setIsAvailable(available);
          setError(available ? null : 'This username is already taken');
        } catch (_err) {
          setIsAvailable(null);
          setError('Error checking username availability');
        }
      } else {
        setIsAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, checkUsernameAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }
    
    if (!isAvailable) {
      setError('Please choose a different username');
      return;
    }
    
    try {
      const result = await setupUsername(username);
      if (!result) {
        setError('Failed to set username. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set username. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <Typography variant="h3" className="text-primary">Choose Your Username</Typography>
          <Typography variant="body2" className="mt-2 text-gray-600">
            Pick a unique username for your account
          </Typography>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="Choose a username"
              className="w-full"
            />
            {username.length > 0 && (
              <div className="text-xs">
                {isAvailable === true && (
                  <span className="text-green-600">✓ Username is available</span>
                )}
                {isAvailable === false && (
                  <span className="text-red-600">✗ Username is already taken</span>
                )}
                {username.length < 3 && (
                  <span className="text-amber-600">Username must be at least 3 characters</span>
                )}
              </div>
            )}
          </div>

          {(error || authError) && (
            <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm">
              {error || authError}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !isAvailable || username.length < 3}
          >
            {loading ? 'Setting up...' : 'Continue'}
          </Button>
        </form>

        <div className="text-center">
          <Typography variant="body2" className="text-gray-600">
            Username will be used for your profile page and mentions
          </Typography>
        </div>
      </Card>
    </div>
  );
};

export default SetupUsernamePage;
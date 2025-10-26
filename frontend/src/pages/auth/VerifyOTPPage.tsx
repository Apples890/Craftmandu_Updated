import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Typography } from '@/components/ui/typography';
import { useNavigate } from 'react-router-dom';

const VerifyOTPPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { verifyOTP, loading, needsOTPVerification, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  // If user doesn't need OTP verification, redirect to dashboard
  React.useEffect(() => {
    if (!needsOTPVerification) {
      navigate('/dashboard');
    }
    
    // Clear any auth errors when mounting component
    clearError();
  }, [needsOTPVerification, navigate, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    try {
      const result = await verifyOTP(otp);
      if (!result) {
        setError('Invalid OTP. Please try again.');
      }
    } catch (_err) {
      setError('Failed to verify OTP. Please try again.');
    }
  };

  const handleResendOTP = () => {
    // Implementation for resending OTP will go here
    // This would typically call an API to generate a new OTP
    setError('OTP resend functionality will be implemented soon.');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <Typography variant="h3" className="text-primary">Verify Your Account</Typography>
          <Typography variant="body2" className="mt-2 text-gray-600">
            Please enter the 6-digit code sent to your email
          </Typography>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full"
              maxLength={6}
            />
          </div>

          {(error || authError) && (
            <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm">
              {error || authError}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </form>

        <div className="text-center">
          <Typography variant="body2" className="text-gray-600">
            Didn't receive the code?{' '}
            <Button
              variant="link"
              className="p-0 h-auto font-medium text-primary"
              onClick={handleResendOTP}
              disabled={loading}
            >
              Resend Code
            </Button>
          </Typography>
        </div>
      </Card>
    </div>
  );
};

export default VerifyOTPPage;
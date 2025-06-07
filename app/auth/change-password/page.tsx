'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { changePassword } = useAuth();
  const router = useRouter();

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers
    };
  };

  const passwordValidation = validatePassword(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (!passwordValidation.isValid) {
      setError('Please meet all password requirements');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await changePassword(currentPassword, newPassword);
      
      if (result.success) {
        setSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute requireVerified>
      <AuthLayout
        title="Change Password"
        description="Update your account password"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {newPassword && (
              <div className="space-y-1 text-xs">
                <div className={`flex items-center space-x-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle size={12} />
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center space-x-2 ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle size={12} />
                  <span>One uppercase letter</span>
                </div>
                <div className={`flex items-center space-x-2 ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle size={12} />
                  <span>One lowercase letter</span>
                </div>
                <div className={`flex items-center space-x-2 ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle size={12} />
                  <span>One number</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={isSubmitting || !passwordValidation.isValid}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Changing password...
              </>
            ) : (
              'Change Password'
            )}
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 hover:underline"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to dashboard
          </button>
        </div>
      </AuthLayout>
    </ProtectedRoute>
  );
}
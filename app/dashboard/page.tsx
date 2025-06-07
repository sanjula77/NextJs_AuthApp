'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Settings, 
  LogOut,
  CheckCircle,
  AlertCircle,
  Key
} from 'lucide-react';

export default function DashboardPage() {
  const { user, signout, isLoading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signout();
    router.push('/auth/signin');
  };

  const handleVerifyEmail = () => {
    router.push('/auth/verify-email');
  };

  const handleChangePassword = () => {
    router.push('/auth/change-password');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.email}</p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User size={20} />
                  <span>Profile</span>
                </CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-900">{user?.email}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-900">
                    Joined {new Date(user?.createdAt || '').toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <Shield size={16} className="text-gray-400" />
                  <div className="flex items-center space-x-2">
                    {user?.isVerified ? (
                      <>
                        <CheckCircle size={16} className="text-green-500" />
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} className="text-orange-500" />
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          Unverified
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings size={20} />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {!user?.isVerified && (
                    <Button
                      onClick={handleVerifyEmail}
                      className="h-20 flex flex-col items-center justify-center space-y-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200"
                      variant="outline"
                    >
                      <Mail size={24} />
                      <span className="text-sm font-medium">Verify Email</span>
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleChangePassword}
                    className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                    variant="outline"
                  >
                    <Key size={24} />
                    <span className="text-sm font-medium">Change Password</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>Overview of your account security</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Account Active</p>
                      <p className="text-xs text-gray-500">Your account is active and secure</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      user?.isVerified ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      {user?.isVerified ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <AlertCircle size={16} className="text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Email {user?.isVerified ? 'Verified' : 'Unverified'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.isVerified 
                          ? 'Your email address is verified' 
                          : 'Please verify your email address'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Shield size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">JWT Secured</p>
                      <p className="text-xs text-gray-500">Protected with JWT tokens</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
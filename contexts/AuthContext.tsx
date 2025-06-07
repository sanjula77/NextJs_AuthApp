'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User, AuthState } from '@/lib/auth';

interface AuthContextType extends AuthState {
  signin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signout: () => Promise<void>;
  sendVerificationCode: () => Promise<{ success: boolean; message: string }>;
  verifyVerificationCode: (code: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  sendForgotPasswordCode: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyForgotPasswordCode: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedUser = authService.getStoredUser();
      if (storedUser && authService.isAuthenticated()) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      authService.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const signin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.signin(email, password);
      if (response.success) {
        const storedUser = authService.getStoredUser();
        setUser(storedUser);
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message || 'Sign in failed' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.signup(email, password);
      return { success: response.success, message: response.message };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const signout = async () => {
    setIsLoading(true);
    try {
      await authService.signout();
      setUser(null);
      window.location.href = '/auth/signin';
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    try {
      return await authService.sendVerificationCode();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send verification code';
      return { success: false, message };
    }
  };

  const verifyVerificationCode = async (code: string) => {
    try {
      const response = await authService.verifyVerificationCode(code);
      if (response.success && user) {
        const updatedUser = { ...user, isVerified: true };
        setUser(updatedUser);
        authService.setStoredUser(updatedUser);
      }
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify code';
      return { success: false, message };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      return await authService.changePassword(currentPassword, newPassword);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change password';
      return { success: false, message };
    }
  };

  const sendForgotPasswordCode = async (email: string) => {
    try {
      return await authService.sendForgotPasswordCode(email);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset code';
      return { success: false, message };
    }
  };

  const verifyForgotPasswordCode = async (email: string, code: string, newPassword: string) => {
    try {
      return await authService.verifyForgotPasswordCode(email, code, newPassword);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset password';
      return { success: false, message };
    }
  };

  const refreshUser = () => {
    const storedUser = authService.getStoredUser();
    setUser(storedUser);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    signin,
    signup,
    signout,
    sendVerificationCode,
    verifyVerificationCode,
    changePassword,
    sendForgotPasswordCode,
    verifyForgotPasswordCode,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
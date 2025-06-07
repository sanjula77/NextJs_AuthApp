import { NextApiRequest } from 'next';

export interface User {
  id: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// API Base URL - replace with your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/auth';

class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'client': 'browser',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include',
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  }

  // Token management
  getAccessToken(): string | null {
    return null;
  }

  getRefreshToken(): string | null {
    return null;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    // Tokens are now handled by cookies
  }

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  }

  // User management
  getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  setStoredUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  // Authentication methods
  async signup(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'client': 'browser',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  private parseJwt(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  }

  async signin(email: string, password: string): Promise<AuthResponse> {
    console.log('Signin attempt:', { email, baseURL: this.baseURL });
    try {
      const response = await fetch(`${this.baseURL}/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'client': 'browser',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      if (data.success) {
        // Parse token and store user data
        const tokenData = this.parseJwt(data.accessToken);
        console.log('Token data:', tokenData);
        
        if (tokenData) {
          const user: User = {
            id: tokenData.userId,
            email: tokenData.email,
            isVerified: tokenData.verified,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          this.setStoredUser(user);
          
          // Store the token in localStorage for client-side auth
          localStorage.setItem('accessToken', data.accessToken);
        }
      }

      return data;
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  }

  async signout(): Promise<void> {
    try {
      await fetch(`${this.baseURL}/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'client': 'browser',
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;

      const response = await this.makeRequest('/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (response.success && response.data) {
        this.setTokens(response.data.accessToken, response.data.refreshToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
  }

  async sendVerificationCode(): Promise<{ success: boolean; message: string }> {
    try {
      // Get the access token and user data
      const accessToken = localStorage.getItem('accessToken');
      const user = this.getStoredUser();
      
      if (!accessToken) {
        throw new Error('No access token found');
      }
      
      if (!user || !user.email) {
        throw new Error('User email not found');
      }

      const response = await fetch(`${this.baseURL}/send-verification-code`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'client': 'browser',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email: user.email }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send verification code');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Send verification code error:', error);
      throw error;
    }
  }

  async verifyVerificationCode(code: string): Promise<{ success: boolean; message: string }> {
    try {
      // Get the access token and user data
      const accessToken = localStorage.getItem('accessToken');
      const user = this.getStoredUser();
      
      if (!accessToken) {
        throw new Error('No access token found');
      }

      if (!user || !user.email) {
        throw new Error('User email not found');
      }

      const response = await fetch(`${this.baseURL}/verify-verification-code`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'client': 'browser',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ 
          email: user.email,
          providedCode: code 
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to verify code');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Verify code error:', error);
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'client': 'browser',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  async sendForgotPasswordCode(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/send-forgot-password-code`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'client': 'browser',
        },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Send forgot password code error:', error);
      throw error;
    }
  }

  async verifyForgotPasswordCode(email: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/verify-forgot-password-code`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'client': 'browser',
        },
        body: JSON.stringify({ email, code, newPassword }),
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Verify forgot password code error:', error);
      throw error;
    }
  }

  // Add method to check authentication status
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    try {
      const tokenData = this.parseJwt(token);
      if (!tokenData) return false;

      // Check if token is expired
      const now = Date.now() / 1000;
      if (tokenData.exp && tokenData.exp < now) {
        this.clearTokens();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      this.clearTokens();
      return false;
    }
  }
}

export const authService = new AuthService();
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { supabase } from '../db/supabase/client';
import { Session } from '@supabase/supabase-js';
import {
  Profile as AppUser,
  LoginCredentials,
  RegistrationData,
  AuthContextType,
} from '../models/Users';
import { authService } from '../api/authService';
import { useNavigate } from 'react-router-dom'; // make sure this is at the top


// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { session, user } = await authService.getSession();
        setSession(session);
        setUser(user);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch session');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

  }, []);


const navigate = useNavigate(); // inside your component or context

const login = async (credentials: LoginCredentials) => {
  setLoading(true);
  setError(null);
  try {
    const { session, user } = await authService.loginWithEmail(
      credentials.email,
      credentials.password
    );

    setSession(session);
    setUser(user);

    // ✅ Role-based redirect
    if (user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'vendor') {
      navigate('/vendor');
    } else {
      navigate('/dashboard');
    }

  } catch (err: any) {
    setError(err.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};


  const register = async (data: RegistrationData) => {
    setLoading(true);
    setError(null);
    try {
      await authService.register(data); // Type adjusted if needed
      setUser(user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.logout();
      setUser(null);
      setSession(null);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<AppUser>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await authService.updateProfile(updates);
      if (updatedUser) {
        setUser(updatedUser);
      }
      return updatedUser;
    } catch (err: any) {
      setError(err.message || 'Profile update failed');
      return null;
    } finally {
      setLoading(false);
    }
  }; 
 

  const recoverSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const { session, user } = await authService.recoverSession();
      setSession(session || null);
      setUser(user || null);
    } catch (err: any) {
      setError(err.message || 'Session recovery failed');
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.sendPasswordResetEmail(email);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  

  const clearError = () => setError(null);

  const value: AuthContextType = {
    setUser,
    setSession,
    user,
    session,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    recoverSession,
    clearError,
    sendPasswordResetEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

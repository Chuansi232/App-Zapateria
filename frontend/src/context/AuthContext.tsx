import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { Role } from '../types';
import type { JwtResponse, User } from '../types';
import type { LoginRequest } from '../types/request/request';
import AuthService from '../services/AuthService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData: JwtResponse = JSON.parse(storedUser);
        setToken(userData.token);
        setUser({ 
          id: userData.id, 
          username: userData.username, 
          email: userData.email || '', 
          roles: userData.roles
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const data = await AuthService.login(credentials);
    setToken(data.token);
    const newUser: User = { 
        id: data.id, 
        username: data.username, 
        email: data.email || '', 
        roles: data.roles
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.roles.includes(Role.ADMINISTRADOR) ?? false;

  const value = {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
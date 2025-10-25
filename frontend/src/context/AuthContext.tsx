
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { JwtResponse, User, Role } from '../types';
import { LoginRequest } from '../types/request';
import AuthService from '../services/AuthService';

/**
 * Contexto para manejar la autenticación en toda la aplicación.
 */

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar el contexto de autenticación
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

  // Cargar el estado de autenticación desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData: JwtResponse = JSON.parse(storedUser);
      setToken(userData.token);
      setUser({ 
        id: userData.id, 
        username: userData.username, 
        email: userData.email, 
        roles: userData.roles.map(role => role as Role) // Casting de string a enum Role
      });
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    const data = await AuthService.login(credentials);
    setToken(data.token);
    const newUser: User = { 
        id: data.id, 
        username: data.username, 
        email: data.email, 
        roles: data.roles.map(role => role as Role)
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.roles.includes(Role.ADMIN) ?? false;

  const value = {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

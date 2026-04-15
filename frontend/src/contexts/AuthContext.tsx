import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../api';
import type { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: api.RegisterData) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'sg_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  // On mount: validate stored token and hydrate user
  useEffect(() => {
    if (!token) { setIsLoading(false); return; }
    api.getMe(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  function storeToken(key: string) {
    localStorage.setItem(TOKEN_KEY, key);
    setToken(key);
  }

  async function login(email: string, password: string) {
    const { key } = await api.login(email, password);
    storeToken(key);
    const me = await api.getMe(key);
    setUser(me);
  }

  async function register(data: api.RegisterData) {
    const { key } = await api.register(data);
    storeToken(key);
    const me = await api.getMe(key);
    setUser(me);
  }

  async function loginWithGoogle(credential: string) {
    const { key, user: me } = await api.loginWithGoogle(credential);
    storeToken(key);
    setUser(me);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

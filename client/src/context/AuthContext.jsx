import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/authApi.js';
import { setAccessToken } from '../services/axiosInstance.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, attempt silent refresh so a page reload keeps the user logged in
  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      try {
        const { data } = await authApi.refresh();
        const token = data?.data?.accessToken;
        setAccessToken(token);
        const me = await authApi.me();
        if (!cancelled) setUser(me.data?.data ?? null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials);
    setAccessToken(data?.data?.accessToken);
    setUser(data?.data?.user ?? null);
    return data?.data?.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload);
    setAccessToken(data?.data?.accessToken);
    setUser(data?.data?.user ?? null);
    return data?.data?.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((partial) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateUser,
    }),
    [user, isLoading, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User, LoginInput, RegisterInput } from "@jobsy/shared";
import {
  apiPost,
  apiGet,
  setAccessToken,
  setRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  getAccessToken,
} from "./api";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthContextType = AuthState & {
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const restoreSession = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        setState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }

      const res = await apiGet<User>("/auth/me");
      if (res.success) {
        setState({
          user: res.data,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        await removeAccessToken();
        await removeRefreshToken();
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    } catch {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (input: LoginInput) => {
    const res = await apiPost<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>("/auth/login", input);

    if (!res.success) {
      throw new Error(res.error.message);
    }

    await setAccessToken(res.data.accessToken);
    await setRefreshToken(res.data.refreshToken);
    setState({
      user: res.data.user,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const res = await apiPost<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>("/auth/register", input);

    if (!res.success) {
      throw new Error(res.error.message);
    }

    await setAccessToken(res.data.accessToken);
    await setRefreshToken(res.data.refreshToken);
    setState({
      user: res.data.user,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost("/auth/logout");
    } catch {
      // Ignore errors on logout
    }
    await removeAccessToken();
    await removeRefreshToken();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await apiGet<User>("/auth/me");
    if (res.success) {
      setState((prev) => ({ ...prev, user: res.data }));
    }
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      refreshUser,
    }),
    [state, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

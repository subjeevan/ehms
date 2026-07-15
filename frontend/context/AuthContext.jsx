"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "@/lib/api";

const AuthContext = createContext(null);

function loadStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    return JSON.parse(localStorage.getItem("hms_user"));
  } catch {
    return null;
  }
}

function saveStoredUser(user) {
  if (typeof window === "undefined") return;

  if (user) {
    localStorage.setItem("hms_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("hms_user");
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("hms_token");
    localStorage.removeItem("hms_user");
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await authApi.me();
    setUser(currentUser);
    saveStoredUser(currentUser);
    return currentUser;
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("hms_token");
    const storedUser = loadStoredUser();

    setToken(storedToken);
    setUser(storedUser);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !token) return;

    refreshUser().catch(() => {
      clearAuth();
    });
  }, [ready, token, refreshUser, clearAuth]);

  useEffect(() => {
    const handleUnauthorized = () => clearAuth();
    window.addEventListener("hms:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("hms:unauthorized", handleUnauthorized);
    };
  }, [clearAuth]);

  const login = useCallback(
    async (credentials) => {
      const result = await authApi.login(credentials);

      localStorage.setItem("hms_token", result.token);
      setToken(result.token);

      try {
        const currentUser = await authApi.me();
        const nextUser = {
          ...currentUser,
          expiresAt: result.expiresAt,
        };

        setUser(nextUser);
        saveStoredUser(nextUser);
      } catch (error) {
        clearAuth();
        throw error;
      }

      return result;
    },
    [clearAuth],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // The token may already be expired.
    }

    clearAuth();
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      user,
      token,
      ready,
      isAuthenticated: Boolean(token && user),
      isAdmin: Boolean(user?.roles?.includes("ROLE_ADMIN")),
      login,
      logout,
      clearAuth,
      refreshUser,
    }),
    [
      user,
      token,
      ready,
      login,
      logout,
      clearAuth,
      refreshUser,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

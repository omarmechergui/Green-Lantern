import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch current authenticated user session from backend
  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get("/auth/me");
      if (isMountedRef.current && response?.data?.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      // 401 is expected when user has no active session
      if (isMountedRef.current) {
        setUser(null);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Log in user with email and password.
   * On success, backend sets the HTTP-only cookie and returns sanitized user.
   */
  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    if (response?.data?.user) {
      setUser(response.data.user);
    }
    return response;
  };

  /**
   * Register a new citizen account.
   * On success, backend sets the HTTP-only cookie and returns 201 with sanitized user.
   */
  const register = async (fullName, email, password, phone, avatar) => {
    const payload = {
      fullName,
      email,
      password,
    };
    if (phone) payload.phone = phone;
    if (avatar) payload.avatar = avatar;

    const response = await api.post("/auth/register", payload);
    if (response?.data?.user) {
      setUser(response.data.user);
    }
    return response;
  };

  /**
   * Log out user. Backend clears the HTTP-only cookie.
   */
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      if (isMountedRef.current) {
        setUser(null);
      }
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

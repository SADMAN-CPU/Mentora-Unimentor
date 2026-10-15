/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext(null);

export const MENTOR_ROLES = ["Senior Student", "Alumni", "Industry Expert"];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(
    () => Boolean(localStorage.getItem("token"))
  );

  // Clear session
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  // Load the logged-in user from GET /api/auth/me
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await axiosClient.get("/auth/me");
      setUser(data.user);
      return data.user;
    } catch {
      logout();
      return null;
    }
  }, [logout]);

  // Restore session on page load
  useEffect(() => {
    if (!localStorage.getItem("token")) return;

    axiosClient
      .get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  // POST /api/auth/login, then load full profile
  const login = async (email, password) => {
    const { data } = await axiosClient.post("/auth/login", {
      email,
      password
    });

    localStorage.setItem("token", data.token);
    return refreshUser();
  };

  // POST /api/auth/register
  const register = async (formData) => {
    const { data } = await axiosClient.post("/auth/register", formData);
    return data;
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: Boolean(user)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

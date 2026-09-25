"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest, setAuthToken, clearAuthToken, getAuthToken } from "./api";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "admin" | "kitchen_manager" | "fpu_manager" | "receiver" | "driver" | "reviewer";
  institution_id?: number;
  receiver_id?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => void;
  switchRoleDemo: (role: User["role"]) => void;
}

const DEMO_USERS: Record<string, User> = {
  admin: {
    id: 1,
    email: "admin@foodloop.gov.in",
    full_name: "Dr. Arvind Sharma (Joint Director, MoFPI)",
    role: "admin",
    institution_id: 1,
  },
  kitchen_manager: {
    id: 2,
    email: "kitchen@foodloop.gov.in",
    full_name: "Chef Manoj Kulkarni (Executive Chef)",
    role: "kitchen_manager",
    institution_id: 1,
  },
  fpu_manager: {
    id: 3,
    email: "fpu@foodloop.gov.in",
    full_name: "Pooja Shinde (Operations Lead)",
    role: "fpu_manager",
    institution_id: 1,
  },
  receiver: {
    id: 4,
    email: "receiver@foodloop.gov.in",
    full_name: "Sunita Patil (Annapoorna Kitchen)",
    role: "receiver",
    receiver_id: 1,
  },
  driver: {
    id: 5,
    email: "driver@foodloop.gov.in",
    full_name: "Rajesh Jadhav (Logistics Driver)",
    role: "driver",
    institution_id: 1,
  },
  reviewer: {
    id: 6,
    email: "reviewer@foodloop.gov.in",
    full_name: "Kavita Deshmukh (Govt Auditor)",
    role: "reviewer",
  },
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { throw new Error("Not implemented"); },
  logout: () => {},
  switchRoleDemo: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check saved user
    const saved = localStorage.getItem("foodloop_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        setUser(DEMO_USERS.kitchen_manager);
      }
    } else {
      // Default to kitchen manager for seamless 5-minute demo
      setUser(DEMO_USERS.kitchen_manager);
      localStorage.setItem("foodloop_user", JSON.stringify(DEMO_USERS.kitchen_manager));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password: pass }),
      });
      setAuthToken(data.access_token);
      const u: User = {
        id: data.user_id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        institution_id: data.institution_id,
        receiver_id: data.receiver_id,
      };
      setUser(u);
      localStorage.setItem("foodloop_user", JSON.stringify(u));
      return u;
    } catch (err) {
      // Match demo user fallback if offline
      for (const key of Object.keys(DEMO_USERS)) {
        if (DEMO_USERS[key].email === email) {
          setUser(DEMO_USERS[key]);
          localStorage.setItem("foodloop_user", JSON.stringify(DEMO_USERS[key]));
          return DEMO_USERS[key];
        }
      }
      throw err;
    }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  const switchRoleDemo = (role: User["role"]) => {
    const u = DEMO_USERS[role] || DEMO_USERS.kitchen_manager;
    setUser(u);
    localStorage.setItem("foodloop_user", JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchRoleDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

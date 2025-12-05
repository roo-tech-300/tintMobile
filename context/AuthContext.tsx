// /context/AuthContext.tsx
import { getCurrentUser, getDbUser, loginUser, logoutUser, registerUser } from "@/appwrite/apis/auth";
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from "react";
import { clearAuth, getAuth, saveAuth } from "../data/authStorage";

export type AuthUser = {
  $id: string;
  email?: string;
  name?: string;
  onBoarding?: boolean;
  // add other fields you expect from Appwrite user object
} | null;

export type AuthContextType = {
  user: AuthUser;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

export type DbUser = {
  $id: string;
  onBoarding: boolean;
  name?: string;
  email?: string;
  avatar?: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();


  useEffect(() => {
    (async () => {
      const local = await getAuth();

      if (local && local.user) {
        setUser(local.user);
        setLoading(false);
        console.log("Loaded user from offline storage", local.user);
      }

      try {
        const remoteUser = await getCurrentUser();

        if (!remoteUser?.$id) {
        throw new Error("User not found");
      }
      const dbUser = await getDbUser(remoteUser?.$id)
      setUser(dbUser);
        await saveAuth({ user: remoteUser })
        console.log("Saved to offline")
      } catch (error: any) {
        console.log("Error finding user", error);
        const isNetworkError =
          error?.message?.includes("network") ||
          error?.message?.includes("Network request failed") ||
          error?.code === "ECONNABORTED" ||
          error?.code === "ENOTFOUND" ||
          error?.code === "ETIMEDOUT";

        if (isNetworkError) {
          console.log("No internet — using local auth");
          setLoading(false);
          return; // do NOT clear storage
        }else{
          console.log("Session expired — clearing auth");
          await clearAuth();
          setLoading(false)
          setUser(null);
        }
      }
    })();
  }, [])

  // 🔶 Login
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await loginUser(email, password);
      const u = await getCurrentUser();
      if (!u?.$id) {
        throw new Error("User not found");
      }
      const dbUser = await getDbUser(u?.$id)
      setUser(dbUser);
      await saveAuth({ user: dbUser, sessionId: res.$id })

      if (dbUser?.onBoarding) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/auth/onboarding")
      }

    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 🔶 Register
  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const session = await registerUser(email, password, name);
      const u = await getCurrentUser();
      if (!u?.$id) {
        throw new Error("User not found");
      }
      const dbUser = await getDbUser(u?.$id)
      setUser(dbUser);
      await saveAuth({ user: dbUser, sessionId: session?.$id })

      router.replace("/auth/onboarding");
    } catch (error) {
      console.error("Error signing up user:", error);
    } finally {
      setLoading(false)
    }
    ;
  };

  // 🔶 Logout
  const logout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      router.replace("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setLoading(false);
    }

    await clearAuth();
    setUser(null);
  };

  // 🔶 Refresh user (used on startup)
  const refreshUser = async () => {
    setLoading(true);
    const u = await getCurrentUser();
    if (!u?.$id) {
        throw new Error("User not found");
      }
    const dbUser = await getDbUser(u?.$id)
    setUser(dbUser);
    await saveAuth({ user: dbUser })
    setLoading(false);
  };


  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

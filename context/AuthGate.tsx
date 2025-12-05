import { router, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "./AuthContext";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "auth";
    const inTabs = segments[0] === "(tabs)";

    // ----------------------------
    // 1. No user → must login
    // ----------------------------
    if (!user) {
      if (!inAuthGroup) {
        router.replace("/auth/login");
      }
      return;
    }

    // ----------------------------
    // 2. User exists but NOT onboarded
    // ----------------------------
    if (!user.onBoarding) {
      if (segments[0] !== "auth" || segments[1] !== "onboarding") {
        router.replace("/auth/onboarding");
      }
      return;
    }

    // ----------------------------
    // 3. User onboarded → allow navigation
    // Only redirect to /home if they are NOT already in tabs
    // ----------------------------
    if (!inTabs) {
      router.replace("/(tabs)/home");
    }

  }, [loading, user, segments]);

  return <>{children}</>;
}

import { router, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "./AuthContext";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "auth";

    if (!user) {
      // Only redirect to login if we are NOT already in the auth flow
      if (!inAuthGroup) {
        router.replace("/auth/login");
        console.log("No user, navigating to login.", user);
      }
    } else if (!user.onBoarding) {       // authenticated → send to main app
      router.replace("/auth/onboarding")
      console.log("User is not yet onboarded", user)
    } else {
      router.replace("/(tabs)/home")
      console.log("User is onboarded", user)
    }
  }, [loading, user, segments]);

  return <>{children}</>;
}

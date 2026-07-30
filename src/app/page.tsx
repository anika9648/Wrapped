"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Splash from "@/components/Splash";
import { useAuth } from "@/context/AuthContext";

export default function RootPage() {
  const [splashDone, setSplashDone] = useState(false);
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!splashDone || loading) return;
    if (!user) {
      router.replace("/login");
    } else if (!profile?.onboardingComplete) {
      router.replace("/onboarding");
    } else {
      router.replace("/home");
    }
  }, [splashDone, loading, user, profile, router]);

  return <Splash onFinish={() => setSplashDone(true)} />;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (!profile?.onboardingComplete) {
      router.replace("/onboarding");
    }
  }, [loading, user, profile, router]);

  if (loading || !user || !profile?.onboardingComplete) {
    return <div className="flex flex-1 items-center justify-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto pb-2">{children}</div>
      <BottomNav />
    </div>
  );
}

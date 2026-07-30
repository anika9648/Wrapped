"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/data";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getUserProfile(cred.user.uid);
      router.push(profile?.onboardingComplete ? "/home" : "/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-3xl font-bold text-[#1f2430]">
          Welcome back
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#52ebcf]"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#52ebcf]"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#ff9292] py-3 font-semibold text-white transition-opacity disabled:opacity-60"
          >
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          New to Wrapped?{" "}
          <Link href="/signup" className="font-semibold text-[#1f2430] underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

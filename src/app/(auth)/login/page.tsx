"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, user, profile, loading, quickLogin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === "admin") {
        router.push("/admin");
      } else if (profile.status === "pending" || profile.status === "rejected" || profile.status === "banned") {
        router.push("/pending");
      } else if (profile.status === "approved") {
        router.push("/discover");
      }
    }
  }, [user, profile, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check your credentials.");
      setIsLoading(false);
    }
  };

  if (loading || (user && profile)) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#FF4458]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#F5F5F5] rounded-2xl flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-[#FF4458]" fill="#FF4458" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Welcome back</h1>
          <p className="text-gray-500 mt-2">Sign in to continue to Zura</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1A1A2E] mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#FF4458] focus:ring-1 focus:ring-[#FF4458] transition-colors bg-white text-[#1A1A2E]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1A1A2E] mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#FF4458] focus:ring-1 focus:ring-[#FF4458] transition-colors bg-white text-[#1A1A2E]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#FF4458] text-white font-bold py-3 px-4 rounded-xl hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6 shadow-sm"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Log in"}
          </button>
        </form>

        {/* Quick Demo Logins for Instant Testing */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider text-center mb-3">
            Quick 1-Click Testing
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={async () => {
                setIsLoading(true);
                try {
                  await quickLogin("admin");
                } catch (e: any) {
                  setError(e.message);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-[#1A1A2E] rounded-xl text-xs font-bold transition-colors text-center border border-gray-200"
            >
              🛡️ Demo Admin
            </button>
            <button
              type="button"
              onClick={async () => {
                setIsLoading(true);
                try {
                  await quickLogin("user");
                } catch (e: any) {
                  setError(e.message);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-[#1A1A2E] rounded-xl text-xs font-bold transition-colors text-center border border-gray-200"
            >
              👤 Demo User (Amina)
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/register" className="font-bold text-[#FF4458] hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

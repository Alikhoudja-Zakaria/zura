"use client";

import Link from "next/link";
import { Heart, Shield, MessageCircle, Users, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { useAuth } from "@/contexts/AuthContext";

export default function LandingPage() {
  const { user, profile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A2E] flex flex-col">
      <header className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-[#FF4458]" fill="#FF4458" />
          <span className="text-2xl font-bold tracking-tight">Zura</span>
        </div>
        <div className="flex items-center gap-3">
          {user && profile ? (
            <>
              <Link
                href={profile.role === "admin" ? "/admin" : "/discover"}
                className="text-xs sm:text-sm font-bold text-[#FF4458] bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                Go to App ({profile.name}) →
              </Link>
              <button
                onClick={async () => {
                  await logout();
                }}
                className="text-xs text-gray-500 hover:text-gray-900 font-semibold px-2 py-1"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="font-semibold text-gray-600 hover:text-[#1A1A2E]">
                Log in
              </Link>
              <Link 
                href="/register" 
                className="bg-[#FF4458] text-white px-5 py-2 rounded-xl font-semibold hover:bg-opacity-90 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        <section className="px-6 py-16 md:py-20 flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6 text-[#1A1A2E]"
          >
            Find Your Match in the Maghreb
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 mb-8 max-w-2xl"
          >
            The premier dating app connecting hearts across Algeria, Morocco, and Tunisia. Clean, secure, and made for you.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-10"
          >
            <div className="flex items-center gap-2.5 bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-xs text-base font-semibold">
              <CountryFlag country="algeria" size="md" /> Algeria
            </div>
            <div className="flex items-center gap-2.5 bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-xs text-base font-semibold">
              <CountryFlag country="morocco" size="md" /> Morocco
            </div>
            <div className="flex items-center gap-2.5 bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-xs text-base font-semibold">
              <CountryFlag country="tunisia" size="md" /> Tunisia
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link 
              href="/register" 
              className="inline-flex items-center gap-2 bg-[#FF4458] text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-opacity-90 transition-colors shadow-sm"
            >
              Get Started <ChevronRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 bg-white text-gray-800 border border-gray-300 px-6 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition-colors"
            >
              Log In
            </Link>
          </motion.div>
        </section>

        <section className="bg-white py-20 border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#F5F5F5] rounded-2xl flex items-center justify-center mb-6 text-[#FF4458]">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Profiles</h3>
              <p className="text-gray-600">Every profile is manually verified to ensure a safe and genuine experience.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#F5F5F5] rounded-2xl flex items-center justify-center mb-6 text-[#FF4458]">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Matching</h3>
              <p className="text-gray-600">Find people who share your values, interests, and relationship goals.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#F5F5F5] rounded-2xl flex items-center justify-center mb-6 text-[#FF4458]">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Chat</h3>
              <p className="text-gray-600">Connect deeply through our private, real-time messaging system.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 px-6 text-center text-gray-500">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-[#FF4458]" />
          <span className="font-bold text-[#1A1A2E]">Zura</span>
        </div>
        <p>© {new Date().getFullYear()} Zura. All rights reserved.</p>
      </footer>
    </div>
  );
}

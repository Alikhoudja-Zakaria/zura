"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { seedSampleData, promoteToAdmin } from "@/lib/seedData";
import { Shield, Database, CheckCircle, ArrowRight, Home } from "lucide-react";
import Link from "next/link";

export default function AdminSetupPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSeed = async () => {
    setSeeding(true);
    setMessage("");
    try {
      const count = await seedSampleData();
      setMessage(`Successfully seeded ${count} sample profiles across Algeria, Morocco, and Tunisia!`);
    } catch (err: any) {
      setMessage(`Error seeding data: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const handlePromote = async () => {
    if (!user) {
      setMessage("Please log in first to promote your account.");
      return;
    }
    setPromoting(true);
    setMessage("");
    try {
      await promoteToAdmin(user.uid);
      await refreshProfile();
      setMessage("Your account has been granted Admin privileges and approved status!");
    } catch (err: any) {
      setMessage(`Error promoting account: ${err.message}`);
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 pt-12">
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#FF4458]/10 text-[#FF4458] flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A2E]">Zura Admin & Dev Setup</h1>
              <p className="text-gray-500 text-sm">Quick actions to test admin review and discovery features</p>
            </div>
          </div>
        </div>

        {message && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm flex items-start gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* Current Account Status */}
        <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Current Account</h2>
          {user ? (
            <div className="grid grid-cols-2 gap-2 text-sm text-[#1A1A2E]">
              <div><span className="text-gray-500">Email:</span> {user.email}</div>
              <div><span className="text-gray-500">Name:</span> {profile?.name || "N/A"}</div>
              <div>
                <span className="text-gray-500">Role:</span>{" "}
                <span className={`font-semibold ${profile?.role === "admin" ? "text-green-600" : "text-gray-700"}`}>
                  {profile?.role || "user"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>{" "}
                <span className={`font-semibold ${profile?.status === "approved" ? "text-green-600" : "text-yellow-600"}`}>
                  {profile?.status || "pending"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No user logged in. Sign in or register to manage your account role.</p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handlePromote}
            disabled={promoting || !user}
            className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 hover:border-[#FF4458] rounded-xl font-semibold text-left text-[#1A1A2E] hover:bg-[#FF4458]/5 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#FF4458]" />
              <div>
                <div className="font-bold">Promote My Account to Admin</div>
                <div className="text-xs text-gray-500 font-normal">Grants full admin privileges & marks profile as approved</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={handleSeed}
            disabled={seeding}
            className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 hover:border-[#FF4458] rounded-xl font-semibold text-left text-[#1A1A2E] hover:bg-[#FF4458]/5 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-[#FF4458]" />
              <div>
                <div className="font-bold">Seed Sample Maghreb Profiles</div>
                <div className="text-xs text-gray-500 font-normal">
                  Adds profiles for Algeria 🇩🇿, Morocco 🇲🇦, Tunisia 🇹🇳 + accounts in review queue
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Navigation Shortcuts */}
        <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="px-4 py-2.5 bg-[#FF4458] text-white rounded-xl text-sm font-semibold hover:bg-opacity-90"
          >
            Go to Admin Dashboard
          </Link>
          <Link
            href="/admin/reviews"
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200"
          >
            Review Queue
          </Link>
          <Link
            href="/discover"
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" /> Discover
          </Link>
        </div>
      </div>
    </div>
  );
}

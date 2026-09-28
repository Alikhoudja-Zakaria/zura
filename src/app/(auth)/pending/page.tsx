"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Hourglass, AlertCircle, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function PendingPage() {
  const { profile, refreshProfile, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (profile?.status === "approved") {
      router.push("/discover");
    } else if (profile?.status === "banned") {
      // Could show a banned state, but handled partially by this page's logic below
    }
  }, [profile, router]);

  const handleRefresh = async () => {
    await refreshProfile();
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (profile?.status === "rejected" || profile?.status === "banned") {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-gray-200 flex flex-col items-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] mb-3">Account {profile.status === "banned" ? "Banned" : "Not Approved"}</h1>
          <p className="text-gray-600 mb-8">
            {profile.rejectionReason 
              ? `Reason: ${profile.rejectionReason}`
              : "Unfortunately, your profile does not meet our guidelines at this time."}
          </p>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-gray-200 flex flex-col items-center">
        <div className="w-20 h-20 bg-[#FF4458] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
          <Hourglass className="w-10 h-10 text-[#FF4458]" />
        </div>
        
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-3">Your account is under review</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Our team will review your profile shortly. You'll be able to start exploring once approved. We verify every profile to ensure a safe community.
        </p>
        
        <div className="w-full space-y-3">
          <button 
            onClick={handleRefresh}
            className="w-full bg-[#FF4458] text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition-colors"
          >
            Check Status
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full bg-transparent text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

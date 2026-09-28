"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Hourglass, AlertCircle, LogOut, Zap, Share2, 
  Smartphone, Copy, Check, ExternalLink, RefreshCw 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function PendingPage() {
  const { profile, refreshProfile, logout } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (profile?.status === "approved") {
      router.push("/discover");
    }
  }, [profile, router]);

  // Periodic automatic status polling every 8 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await refreshProfile();
    }, 8000);
    return () => clearInterval(interval);
  }, [refreshProfile]);

  const handleRefresh = async () => {
    setChecking(true);
    await refreshProfile();
    setTimeout(() => setChecking(false), 500);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const shareText = "Join me on Zura (زورة) — the #1 dating & friendship app for Algeria 🇩🇿, Morocco 🇲🇦, and Tunisia 🇹🇳! Meet verified singles near you: https://zura-tan.vercel.app";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Zura (زورة) - Maghreb Encounters",
          text: shareText,
          url: "https://zura-tan.vercel.app",
        });
      } catch (err) {
        // user cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://zura-tan.vercel.app");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  if (profile?.status === "rejected" || profile?.status === "banned") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5 text-red-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-[#1A1A2E] mb-2 tracking-tight">Account {profile.status === "banned" ? "Banned" : "Not Approved"}</h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            {profile.rejectionReason 
              ? `Reason: ${profile.rejectionReason}`
              : "Unfortunately, your profile does not meet our safety guidelines at this time."}
          </p>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-2xl hover:bg-gray-200 transition-colors text-xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col items-center space-y-6">
        
        {/* Animated Verification Icon */}
        <div className="relative">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center border border-rose-100 text-[#FF385C]">
            <Hourglass className="w-9 h-9 animate-pulse" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
            <Zap size={11} className="fill-white" />
          </span>
        </div>

        {/* Fast Verification Promise */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold mb-3">
            <Zap size={13} className="fill-amber-500 text-amber-600 animate-bounce" />
            <span>Quick: 15 seconds to 30 minutes!</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A2E] tracking-tight">
            Profile Under Fast Review
          </h1>
          
          <p className="text-gray-500 text-xs sm:text-sm mt-2 leading-relaxed">
            Our team & AI verification are reviewing your profile. Verification usually takes anywhere from <strong className="text-gray-800">15 seconds to 30 minutes</strong>! This page refreshes automatically once approved.
          </p>
        </div>

        {/* Status Check Button */}
        <button 
          onClick={handleRefresh}
          disabled={checking}
          className="w-full bg-black hover:bg-neutral-800 active:scale-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
        >
          <RefreshCw size={15} className={checking ? "animate-spin" : ""} />
          <span>{checking ? "Checking approval..." : "Check Approval Status"}</span>
        </button>

        {/* Web App Installation Section */}
        <div className="w-full bg-[#FAF8F5] border border-[#F0ECE6] rounded-2xl p-4 text-left space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-black text-[#1A1A2E]">
            <Smartphone size={16} className="text-[#FF385C]" />
            <span>Install Zura as a Web App on your Phone</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Add Zura to your phone's home screen for full-screen mode and instant match notifications:
          </p>
          <div className="text-[11px] font-medium text-gray-700 space-y-1 bg-white p-3 rounded-xl border border-gray-100">
            <p>🍏 <strong>iPhone (Safari):</strong> Tap <strong>Share (⬆)</strong> at the bottom, then select <strong>"Add to Home Screen ⊞"</strong>.</p>
            <p>🤖 <strong>Android (Chrome):</strong> Tap <strong>Menu (⋮)</strong> top-right, then choose <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
          </div>
        </div>

        {/* Share with Friends Section */}
        <div className="w-full bg-white border border-gray-200/80 rounded-2xl p-4 text-left space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#1A1A2E]">
              <Share2 size={15} className="text-[#0088FF]" />
              <span>Share Zura with Friends</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">🇩🇿 🇲🇦 🇹🇳</span>
          </div>

          <p className="text-[11px] text-gray-500 leading-relaxed">
            Invite friends to join the fastest-growing Maghreb dating community!
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
            >
              <span>WhatsApp</span>
              <ExternalLink size={13} />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="py-2.5 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-gray-200"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span>{copied ? "Link Copied!" : "Share / Copy"}</span>
            </button>
          </div>
        </div>

        {/* Sign out */}
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 py-1 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> 
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

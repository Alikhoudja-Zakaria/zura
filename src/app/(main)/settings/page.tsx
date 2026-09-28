'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, User, Edit2, LogOut, Trash2, 
  ChevronRight, AlertCircle, Heart 
} from 'lucide-react';

export default function SettingsPage() {
  const { user, profile, logout, deleteAccount, quickLogin } = useAuth();
  const router = useRouter();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user || !profile) return null;

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      router.push('/register');
    } catch (error) {
      console.error('Error deleting account:', error);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
        <Link href="/profile" className="p-2 -ml-2 text-gray-600 hover:text-[#1A1A2E] transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-[#1A1A2E]">Settings</h1>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Profile Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Profile</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <Link href="/profile/edit" className="w-full flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF4458]/10 flex items-center justify-center text-[#FF4458]">
                  <Edit2 className="w-4 h-4" />
                </div>
                <span className="font-medium text-[#1A1A2E]">Edit Profile</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
            <Link href="/profile" className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF4458]/10 flex items-center justify-center text-[#FF4458]">
                  <User className="w-4 h-4" />
                </div>
                <span className="font-medium text-[#1A1A2E]">View My Profile</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>

        {/* Account Info Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Account Information</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between">
              <span className="text-gray-600">Email</span>
              <span className="font-medium text-[#1A1A2E]">{profile.email}</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-gray-600">Location</span>
              <span className="font-medium text-[#1A1A2E]">{profile.city}, {profile.country}</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-gray-600">Status</span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                profile.status === 'approved' ? 'bg-green-100 text-green-700' :
                profile.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {profile.status === 'pending' ? 'Under Review' : profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Testing Switcher Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Quick Demo Switcher</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-3">
              Switch immediately between user and admin roles for instant testing:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={async () => {
                  await quickLogin("admin");
                  router.push("/admin");
                }}
                className="py-2.5 px-3 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors text-center"
              >
                🛡️ Switch to Admin
              </button>
              <button
                type="button"
                onClick={async () => {
                  await quickLogin("user");
                  router.push("/discover");
                }}
                className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-[#FF4458] border border-rose-200 rounded-xl text-xs font-bold transition-colors text-center"
              >
                👤 Switch to Amina
              </button>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Actions</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-red-50 text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center gap-3 p-4 hover:bg-red-50 text-red-600 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span className="font-medium">Delete Account</span>
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="pt-6 pb-8 text-center text-gray-400 space-y-2">
          <p className="font-semibold text-gray-500">Zura v1.0</p>
          <p className="flex items-center justify-center gap-1 text-sm">
            Made with <Heart className="w-4 h-4 text-[#FF4458]" fill="currentColor" /> for the Maghreb
          </p>
        </div>

      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-2">Delete Account?</h2>
            <p className="text-gray-500 text-sm mb-6">
              This action is permanent and cannot be undone. All your matches, messages, and profile data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-70"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

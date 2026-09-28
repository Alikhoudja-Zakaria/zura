'use client';

import { useEffect, useState } from 'react';
import { getPendingUsers, updateUserStatus } from '@/lib/firestore';
import { UserProfile } from '@/types';
import { getCountryName } from '@/lib/utils';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

export default function ReviewsPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await getPendingUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading pending users', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(userId: string) {
    try {
      await updateUserStatus(userId, 'approved');
      setUsers(users.filter(u => u.uid !== userId));
    } catch (error) {
      console.error('Error approving user', error);
    }
  }

  async function handleReject() {
    if (!selectedUser || !rejectReason.trim()) return;
    try {
      await updateUserStatus(selectedUser.uid, 'rejected', rejectReason);
      setUsers(users.filter(u => u.uid !== selectedUser.uid));
      setSelectedUser(null);
      setRejectReason('');
      setIsRejecting(false);
    } catch (error) {
      console.error('Error rejecting user', error);
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading pending reviews...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Review Queue</h1>

      {users.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center shadow-sm">
          <p className="text-xl text-gray-500 font-medium">No pending reviews 🎉</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {users.map((user) => (
              <motion.div
                key={user.uid}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Photos */}
                    <div className="flex gap-2 w-full md:w-1/3 overflow-x-auto pb-2">
                      {[user.photo1, user.photo2].filter(Boolean).map((photo: string, i: number) => (
                        <img
                          key={i}
                          src={photo}
                          alt="User photo"
                          className="w-32 h-40 md:w-full md:h-64 object-cover rounded-xl shrink-0"
                        />
                      ))}
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-[#1A1A2E]">
                          {user.name}, {user.age}
                        </h2>
                        <p className="text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <CountryFlag country={user.country} size="xs" />
                          <span>{user.city}, {getCountryName(user.country)}</span>
                        </p>
                      </div>

                      <div>
                        <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-medium mr-2">
                          {user.gender}
                        </span>
                        <span className="inline-block px-3 py-1 bg-[#FF4458]/10 text-[#FF4458] rounded-full text-sm font-medium">
                          Looking for: {user.lookingFor}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-1">Bio</h3>
                        <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-xl">
                          {user.bio || 'No bio provided.'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {user.interests?.map((interest: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                            {interest}
                          </span>
                        ))}
                      </div>
                      
                      <div className="text-xs text-gray-400">
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setIsRejecting(true);
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 font-medium transition-colors"
                    >
                      <X className="w-5 h-5" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(user.uid)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white bg-green-500 hover:bg-green-600 font-medium transition-colors"
                    >
                      <Check className="w-5 h-5" />
                      Approve
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Reject Modal */}
      {isRejecting && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Reject Account</h3>
            <p className="text-sm text-gray-600 mb-4">
              Provide a reason for rejecting {selectedUser.name}.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-[#FF4458] mb-4 h-24 resize-none"
              placeholder="e.g. Inappropriate photos"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsRejecting(false);
                  setRejectReason('');
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

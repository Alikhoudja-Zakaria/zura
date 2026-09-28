'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createReport } from '@/lib/firestore';
import { X } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUserName: string;
}

export default function ReportModal({ isOpen, onClose, reportedUserId, reportedUserName }: ReportModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState('Fake Profile');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await createReport(user.uid, reportedUserId, reason, description);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReason('Fake Profile');
        setDescription('');
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Report {reportedUserName}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Report Submitted</h3>
            <p className="text-gray-500">Thank you for helping keep Zura safe.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border-gray-300 rounded-xl p-3 bg-gray-50 border focus:outline-none focus:ring-2 focus:ring-[#FF4458]/20 focus:border-[#FF4458]"
                required
              >
                <option value="Fake Profile">Fake Profile</option>
                <option value="Inappropriate Content">Inappropriate Content</option>
                <option value="Harassment">Harassment</option>
                <option value="Spam">Spam</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full border-gray-300 rounded-xl p-3 bg-gray-50 border focus:outline-none focus:ring-2 focus:ring-[#FF4458]/20 focus:border-[#FF4458] resize-none"
                placeholder="Please provide more details..."
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-[#FF4458] text-white rounded-xl font-semibold hover:bg-[#ff3045] transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Users, ClipboardCheck, Heart, Flag } from 'lucide-react';
import { getAdminStats } from '@/lib/firestore';

interface AdminStats {
  totalUsers: number;
  pendingReviews: number;
  totalMatches: number;
  openReports: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAdminStats();
        setStats(data as AdminStats);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: Users },
    { label: 'Pending Reviews', value: stats?.pendingReviews, icon: ClipboardCheck },
    { label: 'Total Matches', value: stats?.totalMatches, icon: Heart },
    { label: 'Open Reports', value: stats?.openReports, icon: Flag },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl animate-pulse shadow-sm">
              <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))
        ) : (
          statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-[#FF4458]/10 text-[#FF4458] rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-[#1A1A2E] mb-1">
                  {card.value ?? 0}
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {card.label}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

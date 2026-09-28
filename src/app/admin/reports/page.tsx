'use client';

import { useEffect, useState } from 'react';
import { getReports, updateReportStatus, updateUserStatus } from '@/lib/firestore';
import { Report } from '@/types';
import { ShieldAlert, Check, X, Ban } from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const data = await getReports();
      setReports(data as Report[]);
    } catch (error) {
      console.error('Error fetching reports', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(reportId: string, status: 'reviewed' | 'dismissed') {
    try {
      await updateReportStatus(reportId, status);
      setReports(reports.map(r => r.id === reportId ? { ...r, status } : r));
    } catch (error) {
      console.error('Error updating report status', error);
    }
  }

  async function handleBanUser(userId: string, reportId: string) {
    try {
      await updateUserStatus(userId, 'banned');
      await updateReportStatus(reportId, 'reviewed');
      setReports(reports.map(r => r.id === reportId ? { ...r, status: 'reviewed' } : r));
      alert('User has been banned.');
    } catch (error) {
      console.error('Error banning user', error);
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-red-100 text-red-800',
      reviewed: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-200 text-gray-800',
    }[status] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="w-8 h-8 text-[#FF4458]" />
        <h1 className="text-2xl md:text-3xl font-bold">User Reports</h1>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center shadow-sm">
            <p className="text-xl text-gray-500 font-medium">No reports! Everything looks good.</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1A1A2E]">
                      Reported User ID: {report.reportedId}
                    </span>
                    {getStatusBadge(report.status)}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Reason</h3>
                  <p className="font-medium text-[#1A1A2E]">{report.reason}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-xl text-sm mt-1">
                    {report.description || 'No additional details provided.'}
                  </p>
                </div>

                <div className="text-xs text-gray-400">
                  Reported by: {report.reporterId}
                </div>
              </div>

              {report.status === 'open' && (
                <div className="flex md:flex-col gap-2 justify-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  <button
                    onClick={() => handleStatusChange(report.id, 'reviewed')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl font-medium transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Mark Reviewed
                  </button>
                  <button
                    onClick={() => handleStatusChange(report.id, 'dismissed')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleBanUser(report.reportedId, report.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-xl font-medium transition-colors"
                  >
                    <Ban className="w-4 h-4" />
                    Ban User
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

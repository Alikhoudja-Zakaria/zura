'use client';

import { useEffect, useState } from 'react';
import { getAllUsers, updateUserStatus } from '@/lib/firestore';
import { UserProfile } from '@/types';
import { getCountryName } from '@/lib/utils';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { Search, Eye, Ban, ShieldCheck, X } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleBan(userId: string, currentStatus: string) {
    const newStatus = currentStatus === 'banned' ? 'approved' : 'banned';
    try {
      await updateUserStatus(userId, newStatus as 'approved' | 'banned');
      setUsers(users.map(u => u.uid === userId ? { ...u, status: newStatus as any } : u));
      if (selectedUser?.uid === userId) {
        setSelectedUser(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (error) {
      console.error('Error toggling ban status', error);
    }
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      banned: 'bg-gray-800 text-white',
    }[status] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Manage Users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} registered members</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF4458] transition-colors bg-white text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Location</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.photo1 || 'https://via.placeholder.com/40'} 
                          alt="" 
                          className="w-10 h-10 rounded-full object-cover bg-gray-100"
                        />
                        <div>
                          <span className="font-semibold text-[#1A1A2E] block">{user.name}, {user.age}</span>
                          <span className="text-xs text-gray-400 capitalize">{user.gender}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{user.email}</td>
                    <td className="p-4 text-gray-600 text-sm">
                      <div className="flex items-center gap-1.5">
                        <CountryFlag country={user.country} size="xs" />
                        <span>{user.city}</span>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(user.status)}</td>
                    <td className="p-4 text-gray-600 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-gray-400 hover:text-[#FF4458] hover:bg-[#FF4458]/10 rounded-lg transition-colors"
                          title="View Profile Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => toggleBan(user.uid, user.status)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.status === 'banned' 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={user.status === 'banned' ? 'Unban User' : 'Ban User'}
                        >
                          {user.status === 'banned' ? <ShieldCheck className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-xl font-bold text-[#1A1A2E]">User Profile Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Photos */}
            <div className="grid grid-cols-2 gap-3">
              {[selectedUser.photo1, selectedUser.photo2].filter(Boolean).map((photo, i) => (
                <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 border">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#1A1A2E]">{selectedUser.name}, {selectedUser.age}</h3>
                  <p className="text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <CountryFlag country={selectedUser.country} size="xs" />
                    <span>{selectedUser.city}, {getCountryName(selectedUser.country)}</span>
                  </p>
                </div>
                {getStatusBadge(selectedUser.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl">
                <div><span className="text-gray-500">Email:</span> {selectedUser.email}</div>
                <div><span className="text-gray-500">Gender:</span> {selectedUser.gender}</div>
                <div><span className="text-gray-500">Looking For:</span> {selectedUser.lookingFor}</div>
                <div><span className="text-gray-500">Online:</span> {selectedUser.online ? "Yes" : "No"}</div>
              </div>

              {selectedUser.bio && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Bio</h4>
                  <p className="p-3 bg-gray-50 rounded-xl text-gray-700">{selectedUser.bio}</p>
                </div>
              )}

              {selectedUser.interests?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1.5">Interests</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUser.interests.map((interest, i) => (
                      <span key={i} className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-medium">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-3 border-t border-gray-100">
              <button
                onClick={() => toggleBan(selectedUser.uid, selectedUser.status)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  selectedUser.status === 'banned'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {selectedUser.status === 'banned' ? 'Unban User' : 'Ban User'}
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

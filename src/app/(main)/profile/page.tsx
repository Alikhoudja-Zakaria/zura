'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, Edit2, AlertCircle } from 'lucide-react';
import { getCountryName } from '@/lib/utils';
import { CountryFlag } from '@/components/ui/CountryFlag';

export default function ProfilePage() {
  const { profile } = useAuth();

  if (!profile) {
    return null;
  }

  const photos = [profile.photo1, profile.photo2].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
        <h1 className="text-xl font-bold text-[#1A1A2E]">Profile</h1>
        <Link href="/settings" className="p-2 -mr-2 text-gray-400 hover:text-[#1A1A2E] transition-colors">
          <Settings className="w-6 h-6" />
        </Link>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Account Status */}
        {profile.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-800">Account Under Review</h3>
              <p className="text-xs text-yellow-700 mt-1">
                Your profile is currently being reviewed by our team.
              </p>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          {/* Photos Carousel */}
          <div className="w-full aspect-[3/4] relative bg-gray-100 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {photos.map((photo, i) => (
              <div key={i} className="min-w-full h-full snap-center relative">
                <img
                  src={photo}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
              {photos.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full bg-white shadow-sm ${i === 0 ? 'w-4' : 'w-1.5 opacity-70'}`} />
              ))}
            </div>
          </div>

          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#1A1A2E] flex items-center gap-2">
                  {profile.name}, {profile.age}
                </h2>
                <div className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                  <CountryFlag country={profile.country} size="xs" />
                  <span>{profile.city}, {getCountryName(profile.country)}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <Link
                href="/profile/edit"
                className="w-full py-3 rounded-xl border-2 border-[#FF4458] text-[#FF4458] font-semibold flex items-center justify-center gap-2 hover:bg-[#FF4458]/5 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Link>
            </div>

            <div className="space-y-6">
              {profile.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">About Me</h3>
                  <p className="text-[#1A1A2E] leading-relaxed text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">{profile.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Looking For</h3>
                  <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-sm text-[#1A1A2E] font-medium">
                    {profile.lookingFor === 'serious' ? '💝 Serious' : 
                     profile.lookingFor === 'casual' ? '😊 Casual' : '🤝 Friends'}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Wants to Meet</h3>
                  <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-sm text-[#1A1A2E] font-medium">
                    {profile.interestedIn === 'women' ? '👩 Women' :
                     profile.interestedIn === 'men' ? '👨 Men' : '✨ Everyone'}
                  </div>
                </div>
              </div>

              {profile.interests && profile.interests.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-sm text-[#1A1A2E]">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

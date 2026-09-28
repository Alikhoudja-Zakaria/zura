'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, Edit2, AlertCircle, Heart, Users, Coffee, Check, Briefcase, Globe, MessageSquareQuote } from 'lucide-react';
import { getCountryName } from '@/lib/utils';
import { CountryFlag } from '@/components/ui/CountryFlag';

export default function ProfilePage() {
  const { profile } = useAuth();

  if (!profile) {
    return null;
  }

  const photos = [profile.photo1, profile.photo2].filter(Boolean);

  return (
    <div className="min-h-full bg-white pb-24">
      {/* Seamless Badoo Top Header */}
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between sticky top-0 z-10 bg-white">
        <h1 className="text-2xl sm:text-[28px] font-black text-[#1A1A2E] tracking-tight">Profile</h1>
        <Link 
          href="/settings" 
          className="p-2 -mr-1.5 text-black hover:bg-gray-100 rounded-full transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-5">
        
        {/* Account Status Notice */}
        {profile.status === 'pending' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">Account Under Review</h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Your profile is being reviewed by our team to keep the Zura community safe and verified.
              </p>
            </div>
          </div>
        )}

        {/* Profile Card (Styled matching Badoo Encounters) */}
        <div className="bg-white rounded-[28px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden border border-gray-100">
          {/* Photos Carousel */}
          <div className="w-full aspect-[3/4] relative bg-black flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {photos.map((photo, i) => (
              <div key={i} className="min-w-full h-full snap-center relative">
                <img
                  src={photo}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {/* Bottom vignette */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

            {/* Overlay Info inside Photo Frame */}
            <div className="absolute bottom-4 left-4 right-4 z-10 text-white pointer-events-none">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0088FF] text-white shadow-xs shrink-0">
                  <Check size={12} strokeWidth={3.5} />
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
                  {profile.name}, {profile.age}
                </h2>
              </div>

              {/* Crisp White Pill Badge */}
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-[#1A1A2E] text-xs font-bold shadow-md">
                {profile.lookingFor === 'serious' ? (
                  <>
                    <Heart size={12} className="fill-[#FF385C] text-[#FF385C]" />
                    <span>Serious Relationship</span>
                  </>
                ) : profile.lookingFor === 'friends' ? (
                  <>
                    <Users size={12} className="text-[#0088FF]" />
                    <span>New Friends</span>
                  </>
                ) : (
                  <>
                    <Coffee size={12} className="text-[#8C4A1E]" />
                    <span>Here to date</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-white/95 text-xs font-semibold drop-shadow-sm mt-1.5">
                <CountryFlag country={profile.country} size="xs" />
                <span>{profile.city}, {getCountryName(profile.country)}</span>
              </div>
            </div>

            {/* Dot indicators */}
            {photos.length > 1 && (
              <div className="absolute top-4 right-4 flex gap-1 z-10">
                {photos.map((_, i) => (
                  <div key={i} className="h-1.5 w-4 rounded-full bg-white/80 shadow-xs" />
                ))}
              </div>
            )}
          </div>

          <div className="p-5 space-y-5">
            {/* Edit Profile Action */}
            <Link
              href="/profile/edit"
              className="w-full py-3 rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile & Photos</span>
            </Link>

            {/* Bio */}
            {profile.bio && (
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#F0ECE6]">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">About Me</h3>
                <p className="text-[#1A1A2E] leading-relaxed text-sm">{profile.bio}</p>
              </div>
            )}

            {/* Cultural Prompt */}
            {profile.promptQuestion && profile.promptAnswer && (
              <div className="bg-[#FFFBF5] border border-[#F5E6D3] p-4 rounded-2xl shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C4A1E] mb-1.5">
                  <MessageSquareQuote size={16} className="text-[#D96B27]" />
                  <span>{profile.promptQuestion}</span>
                </div>
                <p className="text-gray-800 text-sm font-medium leading-relaxed italic">
                  "{profile.promptAnswer}"
                </p>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {profile.profession && (
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-800">
                  <Briefcase size={14} className="text-[#FF385C]" />
                  <span>{profile.profession}</span>
                </div>
              )}

              {profile.languages && profile.languages.length > 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700">
                  <Globe size={14} className="text-gray-500" />
                  <span>{profile.languages.join(" • ")}</span>
                </div>
              )}
            </div>

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Interests</h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interests.map((interest: string, i: number) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-gray-50 border border-gray-200 text-xs font-medium text-gray-800">
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
  );
}

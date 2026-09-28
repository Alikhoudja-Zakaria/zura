'use client'

import React, { useState } from 'react'
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion'
import { UserProfile } from '@/types'
import { getCountryName } from '@/lib/utils'
import { CountryFlag } from '@/components/ui/CountryFlag'
import { 
  Sparkles, Flag, Users, CheckCircle2, ChevronDown, 
  Briefcase, Globe, MessageSquareQuote, MapPin 
} from 'lucide-react'
import ReportModal from '@/components/ui/ReportModal'

interface ProfileCardProps {
  profile: UserProfile
  onSwipe: (direction: 'like' | 'pass') => void
  active: boolean
}

export default function ProfileCard({ profile, onSwipe, active }: ProfileCardProps) {
  const [showReport, setShowReport] = useState(false)
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)
  const x = useMotionValue(0)
  const controls = useAnimation()
  
  const rotate = useTransform(x, [-200, 200], [-10, 10])
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0.4, 1, 1, 1, 0.4])
  const likeOpacity = useTransform(x, [0, 80], [0, 1])
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0])

  const [hasSwiped, setHasSwiped] = useState(false)
  const swipeThreshold = 80

  const photos = [profile.photo1, profile.photo2].filter(Boolean)

  const handleDragEnd = async (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x
    const velocity = info.velocity.x
    if (offset > swipeThreshold || velocity > 400) {
      await swipeAction('like')
    } else if (offset < -swipeThreshold || velocity < -400) {
      await swipeAction('pass')
    } else {
      controls.start({ x: 0, rotate: 0, transition: { type: 'spring', stiffness: 350, damping: 25 } })
    }
  }

  const swipeAction = async (direction: 'like' | 'pass') => {
    if (!active || hasSwiped) return
    setHasSwiped(true)
    const xDest = direction === 'like' ? 500 : -500
    await controls.start({
      x: xDest,
      rotate: direction === 'like' ? 14 : -14,
      opacity: 0,
      transition: { duration: 0.22, ease: 'easeOut' }
    })
    onSwipe(direction)
  }

  // Background cards in the deck
  if (!active) {
    return (
      <div className="absolute inset-0 z-0 flex flex-col items-center pointer-events-none">
        <div className="relative h-full w-full rounded-3xl bg-white shadow-md border border-gray-200/60 overflow-hidden scale-[0.96] translate-y-2 opacity-90 transition-transform">
          <div className="relative w-full h-full">
            <img
              src={profile.photo1 || 'https://via.placeholder.com/400x533?text=No+Photo'}
              alt={profile.name}
              className="absolute inset-0 h-full w-full object-cover rounded-3xl"
            />
            <div className="absolute bottom-0 left-0 w-full p-4 bg-[#0F172A]/85 backdrop-blur-xs">
              <div className="flex items-end gap-2">
                <h2 className="text-2xl font-black text-white tracking-tight">{profile.name}</h2>
                <span className="text-xl font-normal text-gray-200">{profile.age}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center select-none">
      <motion.div
        className="relative h-full w-full rounded-3xl bg-white shadow-xl border border-gray-200/80 overflow-hidden flex flex-col"
        style={{ x, rotate, opacity }}
        drag={active ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        dragDirectionLock
        onDragEnd={handleDragEnd}
        animate={controls}
        whileTap={{ cursor: 'grabbing' }}
      >
        {/* Like Stamp Overlay */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute right-6 top-6 z-30 rounded-2xl border-4 border-emerald-500 bg-emerald-500/90 px-4 py-1 text-2xl font-black text-white rotate-12 shadow-md pointer-events-none tracking-wider"
        >
          LIKE
        </motion.div>
        
        {/* Pass Stamp Overlay */}
        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute left-6 top-6 z-30 rounded-2xl border-4 border-rose-500 bg-rose-500/90 px-4 py-1 text-2xl font-black text-white -rotate-12 shadow-md pointer-events-none tracking-wider"
        >
          PASS
        </motion.div>

        {/* Scrollable Card Body (Badoo style: only INSIDE the card scrolls) */}
        <div className="h-full w-full overflow-y-auto scrollbar-hide touch-pan-y overscroll-contain flex flex-col">
          {/* Main Photo Section (Fills full first viewport of the card) */}
          <div className="relative w-full h-[74%] min-h-[300px] shrink-0 bg-gray-900">
            <img
              src={photos[activePhotoIdx] || profile.photo1 || 'https://via.placeholder.com/400x533?text=No+Photo'}
              alt={profile.name}
              className="absolute inset-0 h-full w-full object-cover select-none"
              draggable="false"
            />

            {/* Photo indicators bar (top) */}
            {photos.length > 1 && (
              <div className="absolute top-3 inset-x-3 flex gap-1.5 z-20">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActivePhotoIdx(i)
                    }}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      activePhotoIdx === i ? 'bg-white shadow-xs' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Tap left / right navigation overlay */}
            {photos.length > 1 && (
              <div className="absolute inset-0 z-10 flex">
                <div 
                  className="w-1/2 h-3/4 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActivePhotoIdx(prev => (prev > 0 ? prev - 1 : prev))
                  }}
                  title="Previous photo"
                />
                <div 
                  className="w-1/2 h-3/4 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActivePhotoIdx(prev => (prev < photos.length - 1 ? prev + 1 : prev))
                  }}
                  title="Next photo"
                />
              </div>
            )}

            {/* Info Overlay on Photo (Clean, High contrast, No gradients) */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-[#0F172A]/85 backdrop-blur-xs pointer-events-none z-20 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-black text-white tracking-tight">{profile.name}</h2>
                  <span className="text-2xl font-light text-gray-200">{profile.age}</span>
                  <CheckCircle2 size={18} className="text-rose-400 shrink-0" />
                </div>
                {profile.online && (
                  <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full text-emerald-300 text-xs font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    Online
                  </div>
                )}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-200">
                <div className="flex items-center gap-1.5 font-medium">
                  <CountryFlag country={profile.country} size="xs" />
                  <span>{profile.city}, {getCountryName(profile.country)}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-white/70">
                  <span>Scroll for more</span>
                  <ChevronDown size={14} className="animate-bounce" />
                </div>
              </div>
            </div>
          </div>

          {/* Details Section Inside Card */}
          <div className="p-5 space-y-4 bg-white flex-1">
            {/* Quick Profile Tags (Profession, Languages, Relationship) */}
            <div className="flex flex-wrap gap-2">
              {profile.profession && (
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-800">
                  <Briefcase size={14} className="text-[#FF385C]" />
                  <span>{profile.profession}</span>
                </div>
              )}

              {profile.lookingFor && (
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-100 px-3 py-1.5 text-xs font-bold text-[#FF385C]">
                  <Sparkles size={14} />
                  <span>
                    {profile.lookingFor === 'serious' ? '💝 Serious Relationship' :
                     profile.lookingFor === 'casual' ? '😊 Casual Dating' : '🤝 New Friends'}
                  </span>
                </div>
              )}

              {profile.languages && profile.languages.length > 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700">
                  <Globe size={14} className="text-gray-500" />
                  <span>{profile.languages.join(" • ")}</span>
                </div>
              )}

              {profile.interestedIn && (
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600">
                  <Users size={14} className="text-gray-400" />
                  <span>
                    {profile.interestedIn === 'women' ? 'Wants to meet Women' :
                     profile.interestedIn === 'men' ? 'Wants to meet Men' : 'Wants to meet Everyone'}
                  </span>
                </div>
              )}
            </div>

            {/* Cultural Maghreb Prompt (Hinge/Badoo style) */}
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

            {/* Bio Section */}
            {profile.bio && (
              <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#F0ECE6]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">About</span>
                <p className="text-[#1A1A2E] leading-relaxed text-sm font-normal">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Interests Section */}
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Interests</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interests.map((interest: string, idx: number) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 border border-gray-200/80"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Second Photo Frame */}
            {profile.photo2 && (
              <div className="pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Photo 2</span>
                <div className="w-full relative overflow-hidden rounded-2xl border border-gray-200 shadow-xs" style={{ paddingBottom: '125%' }}>
                  <img
                    src={profile.photo2}
                    alt={`${profile.name} - photo 2`}
                    className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
                    draggable="false"
                  />
                </div>
              </div>
            )}

            {/* Report Profile Button */}
            <div className="pt-2 pb-2 text-center border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowReport(true)}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors py-1 px-3 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <Flag size={12} />
                <span>Report profile</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {showReport && (
        <ReportModal
          isOpen={showReport}
          onClose={() => setShowReport(false)}
          reportedUserId={profile.uid}
          reportedUserName={profile.name}
        />
      )}
    </div>
  )
}

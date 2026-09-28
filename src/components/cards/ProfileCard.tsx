'use client'

import React, { useState } from 'react'
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion'
import { UserProfile } from '@/types'
import { getCountryName } from '@/lib/utils'
import { CountryFlag } from '@/components/ui/CountryFlag'
import { 
  X, Heart, Star, Sparkles, Flag, Users, CheckCircle2, ChevronDown, 
  Briefcase, Globe, MessageSquareQuote, MoreHorizontal
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
  const [hasSwiped, setHasSwiped] = useState(false)
  
  const x = useMotionValue(0)
  const controls = useAnimation()
  
  const rotate = useTransform(x, [-200, 200], [-12, 12])
  const opacity = useTransform(x, [-260, -160, 0, 160, 260], [0.3, 1, 1, 1, 0.3])
  const likeOpacity = useTransform(x, [0, 80], [0, 1])
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0])

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
      controls.start({ x: 0, rotate: 0, transition: { type: 'spring', stiffness: 380, damping: 26 } })
    }
  }

  const swipeAction = async (direction: 'like' | 'pass') => {
    if (!active || hasSwiped) return
    setHasSwiped(true)
    const xDest = direction === 'like' ? 650 : -650
    await controls.start({
      x: xDest,
      rotate: direction === 'like' ? 16 : -16,
      opacity: 0,
      transition: { duration: 0.24, ease: 'easeOut' }
    })
    onSwipe(direction)
  }

  // Preloaded background card waiting behind the active card
  if (!active) {
    return (
      <div className="absolute inset-0 z-0 flex flex-col items-center pointer-events-none select-none">
        <div className="relative h-full w-full rounded-[28px] bg-black shadow-lg border border-gray-200/50 overflow-hidden scale-[0.98] translate-y-1.5 opacity-95 transition-transform duration-300">
          <img
            src={profile.photo1 || 'https://via.placeholder.com/400x533?text=No+Photo'}
            alt={profile.name}
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            draggable="false"
          />

          {/* Top-Left Info Overlay on Background Card */}
          <div className="absolute top-6 left-4 z-20 flex flex-col items-start text-white">
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-black tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                {profile.name}, {profile.age}
              </h2>
              <CheckCircle2 size={20} className="text-rose-400 drop-shadow-md shrink-0 fill-rose-500 text-white" />
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-sm">
              <CountryFlag country={profile.country} size="xs" />
              <span>{profile.city}, {getCountryName(profile.country)}</span>
              {profile.lookingFor && (
                <>
                  <span className="text-white/40">•</span>
                  <span>
                    {profile.lookingFor === 'serious' ? '💝 Serious' :
                     profile.lookingFor === 'casual' ? '😊 Casual' : '🤝 Friends'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons Pre-rendered on Background Card */}
          <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-5 z-30">
            <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-[#1A1A2E] border border-gray-100 opacity-95">
              <X size={28} strokeWidth={2.8} />
            </div>
            <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-amber-500 border border-gray-100 opacity-95">
              <Star size={22} className="fill-amber-400 stroke-amber-500" />
            </div>
            <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-[#FF385C] border border-gray-100 opacity-95">
              <Heart size={34} className="fill-[#FF385C] stroke-[#FF385C]" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center select-none">
      <motion.div
        className="relative h-full w-full rounded-[28px] bg-black shadow-2xl border border-gray-200/60 overflow-hidden flex flex-col touch-none"
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.65}
        dragDirectionLock
        onDragEnd={handleDragEnd}
        animate={controls}
      >
        {/* Like Stamp Overlay */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute right-6 top-8 z-40 rounded-2xl border-4 border-emerald-500 bg-emerald-500/90 px-4 py-1.5 text-2xl font-black text-white rotate-12 shadow-xl pointer-events-none tracking-wider uppercase"
        >
          LIKE
        </motion.div>
        
        {/* Pass Stamp Overlay */}
        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute left-6 top-8 z-40 rounded-2xl border-4 border-rose-500 bg-rose-500/90 px-4 py-1.5 text-2xl font-black text-white -rotate-12 shadow-xl pointer-events-none tracking-wider uppercase"
        >
          PASS
        </motion.div>

        {/* Scrollable Card Body (Badoo style: inside the card scrolls to read full profile) */}
        <div className="h-full w-full overflow-y-auto scrollbar-hide touch-pan-y overscroll-contain flex flex-col relative">
          
          {/* Main Hero Photo Viewport (Takes entire card height initially) */}
          <div className="relative w-full h-full min-h-[500px] shrink-0 bg-black flex flex-col justify-between">
            <img
              src={photos[activePhotoIdx] || profile.photo1 || 'https://via.placeholder.com/400x533?text=No+Photo'}
              alt={profile.name}
              className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
              draggable="false"
              loading="eager"
            />

            {/* Photo indicators bar (top) */}
            {photos.length > 1 && (
              <div className="absolute top-3 inset-x-3 flex gap-1.5 z-30 pointer-events-none">
                {photos.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      activePhotoIdx === i ? 'bg-white shadow-xs' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Tap left / right navigation zones */}
            {photos.length > 1 && (
              <div className="absolute inset-0 z-20 flex">
                <div 
                  className="w-1/2 h-[75%] cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActivePhotoIdx(prev => (prev > 0 ? prev - 1 : prev))
                  }}
                  title="Previous photo"
                />
                <div 
                  className="w-1/2 h-[75%] cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActivePhotoIdx(prev => (prev < photos.length - 1 ? prev + 1 : prev))
                  }}
                  title="Next photo"
                />
              </div>
            )}

            {/* Top-Left Info Overlay (Badoo Style: Bold name, age & status pill) */}
            <div className="absolute top-6 left-4 z-30 flex flex-col items-start pointer-events-none">
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                  {profile.name}, {profile.age}
                </h2>
                <CheckCircle2 size={20} className="text-rose-400 drop-shadow-md shrink-0 fill-rose-500 text-white" />
              </div>
              
              <div className="mt-1.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-sm">
                <CountryFlag country={profile.country} size="xs" />
                <span>{profile.city}, {getCountryName(profile.country)}</span>
                {profile.lookingFor && (
                  <>
                    <span className="text-white/40">•</span>
                    <span>
                      {profile.lookingFor === 'serious' ? '💝 Serious' :
                       profile.lookingFor === 'casual' ? '😊 Casual' : '🤝 Friends'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Top-Right More / Report Button (Badoo Style: •••) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowReport(true)
              }}
              className="absolute top-6 right-4 z-30 p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 active:scale-95 transition-all shadow-md pointer-events-auto cursor-pointer border border-white/10"
              title="Report or options"
            >
              <MoreHorizontal size={20} />
            </button>

            {/* Subtle Scroll Hint just above the buttons */}
            <div className="absolute bottom-24 inset-x-0 flex justify-center items-center z-20 pointer-events-none">
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 backdrop-blur-xs text-[11px] font-semibold text-white/80 border border-white/10 shadow-xs">
                <span>Scroll for bio & details</span>
                <ChevronDown size={14} className="animate-bounce" />
              </div>
            </div>
          </div>

          {/* Details Section Inside Card (Scrollable) */}
          <div className="p-5 space-y-4 bg-white flex-1 pb-32">
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

        {/* 3 Floating Action Buttons Directly Over the Card (Swiped with the pic!) */}
        <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-5 z-40 pointer-events-auto">
          {/* Pass Button (X) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              swipeAction('pass')
            }}
            className="w-14 h-14 rounded-full bg-white shadow-[0_8px_25px_rgba(0,0,0,0.3)] flex items-center justify-center text-[#1A1A2E] hover:scale-110 active:scale-90 transition-transform cursor-pointer border border-gray-100"
            title="Pass"
          >
            <X size={28} strokeWidth={2.8} />
          </button>

          {/* Superlike / Star */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              swipeAction('like')
            }}
            className="w-12 h-12 rounded-full bg-white shadow-[0_8px_25px_rgba(0,0,0,0.3)] flex items-center justify-center text-amber-500 hover:scale-110 active:scale-90 transition-transform cursor-pointer border border-gray-100"
            title="Superlike"
          >
            <Star size={22} className="fill-amber-400 stroke-amber-500" />
          </button>

          {/* Like Button (Heart) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              swipeAction('like')
            }}
            className="w-16 h-16 rounded-full bg-white shadow-[0_8px_25px_rgba(0,0,0,0.3)] flex items-center justify-center text-[#FF385C] hover:scale-110 active:scale-90 transition-transform cursor-pointer border border-gray-100"
            title="Like"
          >
            <Heart size={34} className="fill-[#FF385C] stroke-[#FF385C]" />
          </button>
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

'use client'

import React, { useState, useRef } from 'react'
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion'
import { UserProfile } from '@/types'
import { getCountryName } from '@/lib/utils'
import { CountryFlag } from '@/components/ui/CountryFlag'
import { 
  X, Heart, Sparkles, Flag, MoreHorizontal, 
  Briefcase, Globe, MessageSquareQuote, ChevronDown, ChevronUp,
  Coffee, Users, Check
} from 'lucide-react'
import ReportModal from '@/components/ui/ReportModal'

// Custom Badoo Cupid Arrow Heart Icon (solid black)
function HeartArrowIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Solid black heart */}
      <path
        d="M16 27.2L14.4 25.8C8.5 20.5 4.5 16.9 4.5 12.4C4.5 8.7 7.3 5.9 11 5.9C13.1 5.9 15.1 6.9 16 8.4C16.9 6.9 18.9 5.9 21 5.9C24.7 5.9 27.5 8.7 27.5 12.4C27.5 16.9 23.5 20.5 17.6 25.8L16 27.2Z"
        fill="black"
      />
      {/* Arrow head at bottom-left */}
      <path
        d="M7 25L2 30M2 30L2 25M2 30L7 30"
        stroke="black"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrow fletching at top-right */}
      <path
        d="M25 7L30 2M26 2L30 2L30 6"
        stroke="black"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Badoo Blue Verified Checkmark Badge
function VerifiedBadge() {
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0088FF] text-white shadow-xs shrink-0"
      title="Verified Profile"
    >
      <Check size={12} strokeWidth={3.5} />
    </span>
  )
}

interface ProfileCardProps {
  profile: UserProfile
  onSwipe: (direction: 'like' | 'pass') => void
  active: boolean
}

export default function ProfileCard({ profile, onSwipe, active }: ProfileCardProps) {
  const [showReport, setShowReport] = useState(false)
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)
  const [hasSwiped, setHasSwiped] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  
  const x = useMotionValue(0)
  const controls = useAnimation()
  
  const rotate = useTransform(x, [-200, 200], [-10, 10])
  const opacity = useTransform(x, [-280, -180, 0, 180, 280], [0.4, 1, 1, 1, 0.4])

  // Badoo Center Circular Badges (scaling & opacity driven by horizontal drag)
  const likeOpacity = useTransform(x, [20, 80], [0, 1])
  const likeScale = useTransform(x, [20, 100], [0.65, 1.1])

  const nopeOpacity = useTransform(x, [-80, -20], [1, 0])
  const nopeScale = useTransform(x, [-100, -20], [1.1, 0.65])

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
      controls.start({ x: 0, rotate: 0, transition: { type: 'spring', stiffness: 400, damping: 28 } })
    }
  }

  const swipeAction = async (direction: 'like' | 'pass') => {
    if (!active || hasSwiped) return
    setHasSwiped(true)
    const xDest = direction === 'like' ? 650 : -650
    await controls.start({
      x: xDest,
      rotate: direction === 'like' ? 14 : -14,
      opacity: 0,
      transition: { duration: 0.22, ease: 'easeOut' }
    })
    onSwipe(direction)
  }

  const scrollToDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.clientHeight * 0.88,
        behavior: 'smooth'
      })
    }
  }

  const scrollToTop = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  // Preloaded background card waiting behind the active card in the DOM
  if (!active) {
    return (
      <div className="absolute inset-0 z-10 flex flex-col items-center pointer-events-none select-none overflow-visible">
        <div className="relative h-full w-full rounded-[28px] sm:rounded-[32px] bg-black shadow-lg overflow-hidden scale-[0.98] translate-y-1.5 opacity-95 transition-transform duration-300">
          <img
            src={profile.photo1 || 'https://via.placeholder.com/400x533?text=No+Photo'}
            alt={profile.name}
            className="absolute inset-0 h-full w-full object-cover select-none"
            loading="eager"
            draggable="false"
          />

          {/* Top subtle vignette */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/75 via-black/30 to-transparent pointer-events-none" />

          {/* Bottom subtle vignette */}
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none" />

          {/* Top-Left Info Overlay on Background Card (Badoo Style) */}
          <div className="absolute top-5 left-4 z-20 flex flex-col items-start text-white">
            <div className="flex items-center gap-1.5">
              <VerifiedBadge />
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                {profile.name}, {profile.age}
              </h2>
            </div>
            
            {/* Crisp White Pill Badge (Badoo Style) */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-[#1A1A2E] text-xs font-bold shadow-md">
              {profile.lookingFor === 'serious' ? (
                <>
                  <Heart size={13} className="fill-[#FF385C] text-[#FF385C]" />
                  <span>Serious Relationship</span>
                </>
              ) : profile.lookingFor === 'friends' ? (
                <>
                  <Users size={13} className="text-[#0088FF]" />
                  <span>New Friends</span>
                </>
              ) : (
                <>
                  <Coffee size={13} className="text-[#8C4A1E]" />
                  <span>Here to date</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-white/95 text-xs font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] mt-1.5">
              <CountryFlag country={profile.country} size="xs" />
              <span>{profile.city}, {getCountryName(profile.country)}</span>
            </div>
          </div>

          {/* Action Buttons Pre-rendered on Background Card (Badoo Black & White) */}
          <div className="absolute bottom-5 sm:bottom-6 inset-x-0 flex items-center justify-center gap-5 sm:gap-6 z-30">
            <div className="w-16 h-16 rounded-full bg-white shadow-[0_8px_25px_rgba(0,0,0,0.35)] flex items-center justify-center text-black">
              <X size={32} strokeWidth={3} className="text-black" />
            </div>
            <div className="w-14 h-14 rounded-full bg-white shadow-[0_8px_25px_rgba(0,0,0,0.35)] flex items-center justify-center text-black">
              <HeartArrowIcon className="w-7 h-7" />
            </div>
            <div className="w-16 h-16 rounded-full bg-white shadow-[0_8px_25px_rgba(0,0,0,0.35)] flex items-center justify-center text-black">
              <Heart size={34} className="fill-black stroke-black text-black" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center select-none overflow-visible pointer-events-none">
      <motion.div
        className="relative h-full w-full rounded-[28px] sm:rounded-[32px] bg-black shadow-[0_12px_40px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col select-none pointer-events-auto"
        style={{ x, rotate, opacity, touchAction: 'pan-y' }}
        drag="x"
        dragDirectionLock={true}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
      >
        {/* Badoo Giant Center Like Badge (Pure White Circle + Solid Black Heart) */}
        <motion.div
          style={{ opacity: likeOpacity, scale: likeScale }}
          className="absolute inset-0 m-auto w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white shadow-[0_16px_45px_rgba(0,0,0,0.4)] flex items-center justify-center pointer-events-none z-40"
        >
          <Heart size={54} className="fill-black stroke-black text-black" />
        </motion.div>
        
        {/* Badoo Giant Center Pass Badge (Pure White Circle + Solid Black X) */}
        <motion.div
          style={{ opacity: nopeOpacity, scale: nopeScale }}
          className="absolute inset-0 m-auto w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white shadow-[0_16px_45px_rgba(0,0,0,0.4)] flex items-center justify-center pointer-events-none z-40"
        >
          <X size={54} strokeWidth={3.5} className="text-black" />
        </motion.div>

        {/* Scrollable Container INSIDE the card (Butter-smooth native momentum scrolling, no CSS smooth conflict) */}
        <div 
          ref={scrollRef}
          className="h-full w-full overflow-y-auto scrollbar-hide flex flex-col relative select-none"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y'
          }}
        >
          {/* Main Hero Photo Viewport (100% of visible card height) */}
          <div className="relative w-full h-full min-h-full shrink-0 bg-black flex flex-col justify-between overflow-hidden">
            <img
              src={photos[activePhotoIdx] || profile.photo1 || 'https://via.placeholder.com/400x533?text=No+Photo'}
              alt={profile.name}
              className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
              draggable="false"
              loading="eager"
            />

            {/* Top subtle vignette */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/75 via-black/30 to-transparent pointer-events-none z-10" />

            {/* Bottom subtle vignette for contrast */}
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none z-10" />

            {/* Edge Photo Switchers (Non-blocking tap zones on outer edges so vertical touch scroll is 100% responsive) */}
            {photos.length > 1 && (
              <div 
                className="absolute top-0 inset-x-0 h-[60%] z-20 flex pointer-events-auto"
                onPointerDown={(e) => {
                  pointerStartRef.current = { x: e.clientX, y: e.clientY }
                }}
              >
                <div 
                  className="w-1/2 h-full cursor-pointer"
                  onClick={(e) => {
                    const dy = Math.abs(e.clientY - pointerStartRef.current.y)
                    const dx = Math.abs(e.clientX - pointerStartRef.current.x)
                    if (dy < 12 && dx < 12) {
                      e.stopPropagation()
                      setActivePhotoIdx(prev => (prev > 0 ? prev - 1 : prev))
                    }
                  }}
                  title="Previous photo"
                />
                <div 
                  className="w-1/2 h-full cursor-pointer"
                  onClick={(e) => {
                    const dy = Math.abs(e.clientY - pointerStartRef.current.y)
                    const dx = Math.abs(e.clientX - pointerStartRef.current.x)
                    if (dy < 12 && dx < 12) {
                      e.stopPropagation()
                      setActivePhotoIdx(prev => (prev < photos.length - 1 ? prev + 1 : prev))
                    }
                  }}
                  title="Next photo"
                />
              </div>
            )}

            {/* Vertical Photo Slider Indicator on Right Edge (Badoo Style) */}
            {photos.length > 1 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 z-25 flex flex-col gap-1.5 pointer-events-none">
                {photos.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-200 ${
                      activePhotoIdx === i 
                        ? 'h-8 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' 
                        : 'h-3 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Top-Left Info (Badoo Style: Verified Badge + Name, Age + White Pill Badge) */}
            <div className="absolute top-5 left-4 z-30 flex flex-col items-start pointer-events-none select-none">
              <div className="flex items-center gap-1.5">
                <VerifiedBadge />
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  {profile.name}, {profile.age}
                </h2>
              </div>
              
              {/* Crisp White Pill Badge (Badoo Style) */}
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-[#1A1A2E] text-xs font-bold shadow-md backdrop-blur-xs">
                {profile.lookingFor === 'serious' ? (
                  <>
                    <Heart size={13} className="fill-[#FF385C] text-[#FF385C]" />
                    <span>Serious Relationship</span>
                  </>
                ) : profile.lookingFor === 'friends' ? (
                  <>
                    <Users size={13} className="text-[#0088FF]" />
                    <span>New Friends</span>
                  </>
                ) : (
                  <>
                    <Coffee size={13} className="text-[#8C4A1E]" />
                    <span>Here to date</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-white/95 text-xs font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] mt-1.5">
                <CountryFlag country={profile.country} size="xs" />
                <span>{profile.city}, {getCountryName(profile.country)}</span>
              </div>
            </div>

            {/* Top-Right More / Options Button (Badoo Style: •••) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowReport(true)
              }}
              className="absolute top-5 right-4 z-30 p-2.5 rounded-full bg-black/25 hover:bg-black/50 backdrop-blur-xs text-white active:scale-95 transition-all shadow-md pointer-events-auto cursor-pointer"
              title="Report profile"
            >
              <MoreHorizontal size={22} className="text-white drop-shadow-md" />
            </button>

            {/* Subtle Profile Details Pill (Tap to scroll down) */}
            <div className="absolute bottom-24 inset-x-0 flex justify-center items-center z-25 pointer-events-auto">
              <button
                type="button"
                onClick={scrollToDetails}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white/95 border border-white/20 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <span>Profile details</span>
                <ChevronDown size={13} className="animate-bounce" />
              </button>
            </div>
          </div>

          {/* Details Section inside the card (Revealed by scrolling down!) */}
          <div className="p-5 space-y-4 bg-white flex-1 shrink-0 pb-36 border-t border-gray-100">
            {/* Scroll back to photo button */}
            <div className="flex justify-center pt-1 pb-1">
              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ChevronUp size={14} />
                <span>Back to photo</span>
              </button>
            </div>

            {/* About Me / Bio */}
            {profile.bio && (
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#F0ECE6]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">About Me</span>
                <p className="text-[#1A1A2E] leading-relaxed text-sm">{profile.bio}</p>
              </div>
            )}

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
            </div>

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
            <div className="pt-4 pb-2 text-center border-t border-gray-100">
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

        {/* 3 Badoo Action Buttons (Pure White Circles + Solid Black Icons, Swiped with pic!) */}
        <div className="absolute bottom-5 sm:bottom-6 inset-x-0 flex items-center justify-center gap-5 sm:gap-6 z-30 pointer-events-auto">
          {/* Pass Button (X) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              swipeAction('pass')
            }}
            className="w-16 h-16 rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.38)] flex items-center justify-center text-black hover:scale-110 active:scale-90 transition-transform cursor-pointer border border-gray-100"
            title="Pass"
          >
            <X size={32} strokeWidth={3} className="text-black" />
          </button>

          {/* Cupid / Crush Button (Heart with Arrow) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              swipeAction('like')
            }}
            className="w-14 h-14 rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.38)] flex items-center justify-center text-black hover:scale-110 active:scale-90 transition-transform cursor-pointer border border-gray-100"
            title="Crush"
          >
            <HeartArrowIcon className="w-7 h-7" />
          </button>

          {/* Like Button (Heart) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              swipeAction('like')
            }}
            className="w-16 h-16 rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.38)] flex items-center justify-center text-black hover:scale-110 active:scale-90 transition-transform cursor-pointer border border-gray-100"
            title="Like"
          >
            <Heart size={34} className="fill-black stroke-black text-black" />
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

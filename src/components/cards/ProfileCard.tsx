'use client'

import React, { useState } from 'react'
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion'
import { UserProfile } from '@/types'
import { getCountryName } from '@/lib/utils'
import { CountryFlag } from '@/components/ui/CountryFlag'
import { 
  X, Heart, Sparkles, Flag, MoreHorizontal, 
  Briefcase, Globe, MessageSquareQuote 
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

interface ProfileCardProps {
  profile: UserProfile
  onSwipe: (direction: 'like' | 'pass') => void
  active: boolean
}

export default function ProfileCard({ profile, onSwipe, active }: ProfileCardProps) {
  const [showReport, setShowReport] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)
  const [hasSwiped, setHasSwiped] = useState(false)
  
  const x = useMotionValue(0)
  const controls = useAnimation()
  
  const rotate = useTransform(x, [-200, 200], [-10, 10])
  const opacity = useTransform(x, [-280, -180, 0, 180, 280], [0.4, 1, 1, 1, 0.4])
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

  // Preloaded background card waiting behind the active card
  if (!active) {
    return (
      <div className="absolute inset-0 z-0 flex flex-col items-center pointer-events-none select-none touch-none overflow-hidden">
        <div className="relative h-full w-full rounded-[28px] bg-black shadow-lg overflow-hidden scale-[0.98] translate-y-1.5 opacity-95 transition-transform duration-300">
          <img
            src={profile.photo1 || 'https://via.placeholder.com/400x533?text=No+Photo'}
            alt={profile.name}
            className="absolute inset-0 h-full w-full object-cover select-none"
            loading="eager"
            draggable="false"
          />

          {/* Top-Left Info Overlay on Background Card (Badoo Style) */}
          <div className="absolute top-6 left-4 z-20 flex flex-col items-start text-white">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
              {profile.name}, {profile.age}
            </h2>
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E51C38] text-white text-xs font-bold shadow-md">
              <Heart size={12} className="fill-white stroke-white" />
              <span>
                {profile.lookingFor === 'serious' ? 'Serious' :
                 profile.lookingFor === 'friends' ? 'New Friends' : 'Liked you'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-white/90 text-xs font-semibold drop-shadow-md mt-1">
              <CountryFlag country={profile.country} size="xs" />
              <span>{profile.city}, {getCountryName(profile.country)}</span>
            </div>
          </div>

          {/* Action Buttons Pre-rendered on Background Card (Badoo Black & White) */}
          <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-6 z-30">
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
    <div className="absolute inset-0 z-10 flex flex-col items-center select-none touch-none overflow-hidden">
      <motion.div
        className="relative h-full w-full rounded-[28px] bg-black shadow-2xl overflow-hidden flex flex-col touch-none select-none overscroll-none"
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

        {/* 100% NON-SCROLLABLE CARD (Entire photo fills card, zero vertical scroll) */}
        <div className="relative w-full h-full bg-black overflow-hidden flex flex-col justify-between select-none touch-none">
          <img
            src={photos[activePhotoIdx] || profile.photo1 || 'https://via.placeholder.com/400x533?text=No+Photo'}
            alt={profile.name}
            className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
            draggable="false"
            loading="eager"
          />

          {/* Photo Tap Areas (Left/Right to switch photo) */}
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

          {/* Vertical Photo Slider Indicator on Right Edge (Badoo Style) */}
          {photos.length > 1 && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 z-25 flex flex-col gap-1.5 pointer-events-none">
              {photos.map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all ${
                    activePhotoIdx === i ? 'h-8 bg-white shadow-xs' : 'h-3 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Top-Left Info (Badoo Style: Name, Age & Red Liked You / Intent Badge) */}
          <div className="absolute top-6 left-4 z-30 flex flex-col items-start pointer-events-none select-none">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
              {profile.name}, {profile.age}
            </h2>
            
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E51C38] text-white text-xs font-bold shadow-md">
              <Heart size={12} className="fill-white stroke-white" />
              <span>
                {profile.lookingFor === 'serious' ? 'Serious' :
                 profile.lookingFor === 'friends' ? 'New Friends' : 'Liked you'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-white/90 text-xs font-semibold drop-shadow-md mt-1">
              <CountryFlag country={profile.country} size="xs" />
              <span>{profile.city}, {getCountryName(profile.country)}</span>
            </div>
          </div>

          {/* Top-Right More / Options Button (Badoo Style: •••) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowDetailsModal(true)
            }}
            className="absolute top-6 right-4 z-30 p-2.5 rounded-full bg-black/35 backdrop-blur-xs text-white hover:bg-black/55 active:scale-95 transition-all shadow-md pointer-events-auto cursor-pointer"
            title="Profile details & report"
          >
            <MoreHorizontal size={22} className="text-white" />
          </button>

          {/* Bio Snippet Overlay (Docked cleanly above the 3 action buttons) */}
          {profile.bio && (
            <div className="absolute bottom-26 left-4 right-4 z-20 pointer-events-none">
              <p className="text-white text-xs font-medium line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10 max-w-[88%]">
                {profile.bio}
              </p>
            </div>
          )}

          {/* 3 Badoo Action Buttons (Pure White Circles + Solid Black Icons, Swiped with pic!) */}
          <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-6 z-30 pointer-events-auto">
            {/* Pass Button (X) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                swipeAction('pass')
              }}
              className="w-16 h-16 rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex items-center justify-center text-black hover:scale-110 active:scale-90 transition-transform cursor-pointer border border-gray-100"
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
              className="w-14 h-14 rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex items-center justify-center text-black hover:scale-110 active:scale-90 transition-transform cursor-pointer border border-gray-100"
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
              className="w-16 h-16 rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex items-center justify-center text-black hover:scale-110 active:scale-90 transition-transform cursor-pointer border border-gray-100"
              title="Like"
            >
              <Heart size={34} className="fill-black stroke-black text-black" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Details & Report Modal (Opened via ••• icon) */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-[#0F172A] text-lg">{profile.name}, {profile.age}</h3>
                <p className="text-xs text-gray-500">{profile.city}, {getCountryName(profile.country)}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {profile.bio && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">About</span>
                <p className="text-[#1A1A2E] text-sm leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">{profile.bio}</p>
              </div>
            )}

            {profile.promptQuestion && profile.promptAnswer && (
              <div className="bg-[#FFFBF5] border border-[#F5E6D3] p-3.5 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C4A1E] mb-1">
                  <MessageSquareQuote size={14} className="text-[#D96B27]" />
                  <span>{profile.promptQuestion}</span>
                </div>
                <p className="text-gray-800 text-xs italic">"{profile.promptAnswer}"</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 text-xs">
              {profile.profession && (
                <div className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-lg text-gray-700">
                  <Briefcase size={12} />
                  <span>{profile.profession}</span>
                </div>
              )}
              {profile.languages && profile.languages.length > 0 && (
                <div className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-lg text-gray-700">
                  <Globe size={12} />
                  <span>{profile.languages.join(" • ")}</span>
                </div>
              )}
            </div>

            {profile.photo2 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Second Photo</span>
                <div className="w-full relative overflow-hidden rounded-xl border border-gray-200" style={{ paddingBottom: '100%' }}>
                  <img
                    src={profile.photo2}
                    alt={`${profile.name} - photo 2`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false)
                  setShowReport(true)
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Flag size={13} /> Report Profile
              </button>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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

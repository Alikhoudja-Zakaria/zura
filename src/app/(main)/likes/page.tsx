'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUsersWhoLikedYou, createSwipe, createMatch } from '@/lib/firestore'
import { UserProfile } from '@/types'
import { Heart, X, Sparkles, Check, Coffee, Users, Zap, ArrowRight, MessageSquareQuote } from 'lucide-react'
import { CountryFlag } from '@/components/ui/CountryFlag'
import { getCountryName } from '@/lib/utils'
import MatchModal from '@/components/cards/MatchModal'
import Link from 'next/link'

export default function LikesPage() {
  const { user, profile } = useAuth()
  const [likers, setLikers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [matchData, setMatchData] = useState<{ user1: UserProfile; user2: UserProfile } | null>(null)

  const loadLikers = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getUsersWhoLikedYou(user.uid)
      setLikers(data)
    } catch (error) {
      console.error("Failed to load users who liked you:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLikers()
  }, [user])

  const handleAction = async (targetUser: UserProfile, action: 'like' | 'pass') => {
    if (!user || !profile) return

    // Immediately remove from list for responsive UX
    setLikers(prev => prev.filter(p => p.uid !== targetUser.uid))

    try {
      await createSwipe(user.uid, targetUser.uid, action)
      if (action === 'like') {
        await createMatch(user.uid, targetUser.uid)
        setMatchData({ user1: profile, user2: targetUser })
      }
    } catch (err) {
      console.error("Error responding to like:", err)
    }
  }

  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto bg-white min-h-full">
        <div className="h-8 w-44 bg-gray-100 rounded-lg mb-6 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-[28px]"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto bg-white min-h-full pb-20">
      {/* Seamless Badoo Top Header */}
      <div className="flex items-center justify-between mb-2 pt-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-[28px] font-black text-[#1A1A2E] tracking-tight">
            Likes You
          </h1>
          {likers.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-[#FF385C] border border-rose-100 text-xs font-bold">
              {likers.length} new
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-5">
        People in the Maghreb who liked your profile. Like them back to match instantly!
      </p>

      {likers.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-4 border border-rose-100 text-[#FF385C]">
            <Heart className="w-10 h-10 fill-[#FF385C]" />
          </div>
          <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 tracking-tight">No new likes yet</h2>
          <p className="text-gray-500 text-sm max-w-xs mb-6 leading-relaxed">
            Keep discovering profiles or activate a Free Boost in Encounters to be seen by more people!
          </p>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-neutral-800 text-white rounded-full font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Zap size={14} className="fill-white" />
            <span>Go to Encounters</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {likers.map((liker) => (
            <div 
              key={liker.uid}
              className="relative aspect-[3/4] rounded-[28px] overflow-hidden bg-black shadow-lg border border-gray-100 group flex flex-col justify-between p-4"
            >
              <img
                src={liker.photo1 || 'https://via.placeholder.com/400x533?text=No+Photo'}
                alt={liker.name}
                className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
              />

              {/* Top Vignette */}
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/75 via-black/25 to-transparent pointer-events-none" />

              {/* Bottom Vignette */}
              <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

              {/* Top info badge */}
              <div className="relative z-10 text-white flex flex-col items-start pointer-events-none">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#0088FF] text-white shadow-xs shrink-0">
                    <Check size={10} strokeWidth={3.5} />
                  </span>
                  <h3 className="text-xl font-black tracking-tight drop-shadow-md">
                    {liker.name}, {liker.age}
                  </h3>
                </div>

                {/* White pill badge */}
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/95 text-[#1A1A2E] text-[11px] font-bold shadow-sm">
                  {liker.lookingFor === 'serious' ? (
                    <>
                      <Heart size={11} className="fill-[#FF385C] text-[#FF385C]" />
                      <span>Serious</span>
                    </>
                  ) : liker.lookingFor === 'friends' ? (
                    <>
                      <Users size={11} className="text-[#0088FF]" />
                      <span>Friends</span>
                    </>
                  ) : (
                    <>
                      <Coffee size={11} className="text-[#8C4A1E]" />
                      <span>Dating</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-white/90 text-xs font-semibold drop-shadow-sm mt-1">
                  <CountryFlag country={liker.country} size="xs" />
                  <span>{liker.city}, {getCountryName(liker.country)}</span>
                </div>
              </div>

              {/* Prompt preview if available */}
              {liker.promptAnswer && (
                <div className="relative z-10 bg-black/40 backdrop-blur-xs p-2.5 rounded-xl border border-white/10 text-white text-xs mb-1">
                  <p className="line-clamp-2 italic text-[11px] text-white/90">"{liker.promptAnswer}"</p>
                </div>
              )}

              {/* Direct Match / Pass Action Buttons */}
              <div className="relative z-10 flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleAction(liker, 'pass')}
                  className="w-12 h-12 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer"
                  title="Pass"
                >
                  <X size={22} strokeWidth={2.5} />
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(liker, 'like')}
                  className="flex-1 py-3 px-4 rounded-full bg-white text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Like Back to Match"
                >
                  <Heart size={16} className="fill-black stroke-black" />
                  <span>Match Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {matchData && (
        <MatchModal
          currentUser={matchData.user1}
          matchedUser={matchData.user2}
          onClose={() => setMatchData(null)}
        />
      )}
    </div>
  )
}

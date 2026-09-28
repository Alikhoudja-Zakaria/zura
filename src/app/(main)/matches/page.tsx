'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserMatches } from '@/lib/firestore'
import { Match, UserProfile } from '@/types'
import { Heart, MessageCircle, Sparkles, Check, ArrowRight } from 'lucide-react'
import { CountryFlag } from '@/components/ui/CountryFlag'
import Link from 'next/link'

export default function MatchesPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMatches() {
      if (!user) return
      try {
        const data = await getUserMatches(user.uid)
        setMatches(data)
      } catch (error) {
        console.error("Failed to load matches:", error)
      } finally {
        setLoading(false)
      }
    }
    loadMatches()
  }, [user])

  function getOtherUser(match: Match): UserProfile | undefined {
    if (!user) return undefined
    return match.user1Id === user.uid ? match.user2Profile : match.user1Profile
  }

  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="h-8 w-36 bg-gray-100 rounded-lg mb-6 animate-pulse"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-[26px]"></div>
          ))}
        </div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-4 text-center bg-white">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-4 border border-rose-100">
          <Heart className="w-10 h-10 text-[#FF385C]" />
        </div>
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 tracking-tight">No matches yet</h2>
        <p className="text-gray-500 text-sm max-w-xs mb-6 leading-relaxed">
          Keep discovering people across Algeria, Morocco, and Tunisia. When you both like each other, you'll match here!
        </p>
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-neutral-800 text-white rounded-full font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <span>Start Swiping</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto bg-white min-h-full">
      {/* Seamless Badoo Top Header */}
      <div className="flex items-center justify-between mb-5 pt-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-[28px] font-black text-[#1A1A2E] tracking-tight">
            Matches
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
            {matches.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
        {matches.map((match) => {
          const otherUser = getOtherUser(match)
          if (!otherUser) return null
          
          return (
            <Link key={match.id} href={`/chat/${match.id}`}>
              <div className="relative aspect-[3/4] rounded-[24px] overflow-hidden group bg-black shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer">
                {otherUser.photo1 ? (
                  <img
                    src={otherUser.photo1}
                    alt={otherUser.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white/50">
                    No photo
                  </div>
                )}

                {/* Subtle vignette */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                {/* Info Overlay */}
                <div className="absolute bottom-0 inset-x-0 p-3 flex flex-col justify-end text-white pointer-events-none">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#0088FF] text-white shrink-0">
                      <Check size={10} strokeWidth={3.5} />
                    </span>
                    <span className="font-black text-white text-base leading-tight truncate drop-shadow-sm">
                      {otherUser.name}, {otherUser.age}
                    </span>
                    {otherUser.online && (
                      <span className="w-2 h-2 bg-emerald-500 rounded-full border border-white shrink-0"></span>
                    )}
                  </div>

                  <div className="flex items-center text-white/90 text-xs mt-1 gap-1.5">
                    <CountryFlag country={otherUser.country} size="xs" />
                    <span className="truncate drop-shadow-sm">{otherUser.city}</span>
                  </div>
                </div>

                {/* Chat Action Bubble */}
                <div className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-black group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-4 h-4 text-black" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

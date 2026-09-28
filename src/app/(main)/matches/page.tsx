'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserMatches } from '@/lib/firestore'
import { Match, UserProfile } from '@/types'
import { Heart, MessageCircle } from 'lucide-react'
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
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="aspect-[3/4] bg-gray-200 animate-pulse rounded-2xl"></div>
        ))}
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] px-4 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Heart className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-[#1A1A2E] mb-2">No matches yet</h2>
        <p className="text-gray-500">Keep swiping! Your next match could be just around the corner.</p>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6">Matches</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {matches.map((match) => {
          const otherUser = getOtherUser(match)
          if (!otherUser) return null
          
          return (
            <Link key={match.id} href={`/chat/${match.id}`}>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden group bg-gray-100 cursor-pointer">
                {otherUser.photo1 && (
                  <img
                    src={otherUser.photo1}
                    alt={otherUser.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-0 inset-x-0 bg-black/40 flex flex-col justify-end p-3 pt-6">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-lg leading-tight">{otherUser.name}, {otherUser.age}</span>
                    {otherUser.online && (
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex items-center text-white/90 text-sm mt-1 gap-1.5">
                    <CountryFlag country={otherUser.country} size="xs" />
                    <span className="truncate">{otherUser.city}</span>
                  </div>
                </div>
                <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

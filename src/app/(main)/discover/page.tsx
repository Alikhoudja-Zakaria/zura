'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getApprovedUsers, getSwipedUserIds, createSwipe, checkMutualLike, createMatch } from '@/lib/firestore'
import { UserProfile, Country } from '@/types'
import ProfileCard from '@/components/cards/ProfileCard'
import MatchModal from '@/components/cards/MatchModal'
import { CountryFlag } from '@/components/ui/CountryFlag'
import { 
  X, RotateCcw, SlidersHorizontal, Sparkles, 
  MapPin, Zap, Flame, CheckCircle2
} from 'lucide-react'

export default function DiscoverPage() {
  const { user, profile } = useAuth()
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [selectedCountry, setSelectedCountry] = useState<'all' | Country>('all')
  const [interestFilter, setInterestFilter] = useState<'all' | 'women' | 'men' | 'friends'>('all')
  const [citySearch, setCitySearch] = useState('')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showBoostModal, setShowBoostModal] = useState(false)
  const [isBoosted, setIsBoosted] = useState(false)
  const [boostMinutesLeft, setBoostMinutesLeft] = useState(30)
  const [loading, setLoading] = useState(true)
  const [matchData, setMatchData] = useState<{ user1: UserProfile; user2: UserProfile } | null>(null)

  // Boost timer management
  useEffect(() => {
    const boostExpiry = localStorage.getItem('zura_boost_expiry')
    if (boostExpiry) {
      const remaining = Math.max(0, Math.floor((parseInt(boostExpiry, 10) - Date.now()) / 60000))
      if (remaining > 0) {
        setIsBoosted(true)
        setBoostMinutesLeft(remaining)
      } else {
        localStorage.removeItem('zura_boost_expiry')
      }
    }
  }, [])

  const handleActivateBoost = () => {
    const expiry = Date.now() + 30 * 60 * 1000
    localStorage.setItem('zura_boost_expiry', expiry.toString())
    setIsBoosted(true)
    setBoostMinutesLeft(30)
    setShowBoostModal(false)
  }

  const loadProfiles = async () => {
    if (!user || !profile) return
    setLoading(true)
    try {
      const approvedUsers = await getApprovedUsers(user.uid)
      const swipedIds = await getSwipedUserIds(user.uid)
      
      const availableProfiles = approvedUsers.filter(
        (p) => p.uid !== user.uid && !swipedIds.includes(p.uid)
      )
      
      setProfiles(availableProfiles)
    } catch (error) {
      console.error('Error loading profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfiles()
  }, [user, profile])

  // Sync default filter to user preference
  useEffect(() => {
    if (profile?.interestedIn) {
      if (profile.interestedIn === 'women') setInterestFilter('women')
      else if (profile.interestedIn === 'men') setInterestFilter('men')
      else setInterestFilter('all')
    }
  }, [profile?.interestedIn])

  const handleSwipe = async (targetUserId: string, direction: 'like' | 'pass') => {
    if (!user || !profile) return
    
    const targetProfile = profiles.find((p) => p.uid === targetUserId)
    if (!targetProfile) return
    
    // Remove from state immediately for instant feedback
    setProfiles((prev) => prev.filter((p) => p.uid !== targetUserId))

    try {
      await createSwipe(user.uid, targetUserId, direction)
      if (direction === 'like') {
        const isMutual = await checkMutualLike(user.uid, targetUserId)
        if (isMutual) {
          await createMatch(user.uid, targetUserId)
          setMatchData({ user1: profile, user2: targetProfile })
        }
      }
    } catch (error) {
      console.error('Error recording swipe:', error)
    }
  }

  // Filter profiles based on selected country, intent, and city
  const filteredProfiles = profiles.filter(p => {
    if (selectedCountry !== 'all' && p.country !== selectedCountry) {
      return false
    }
    if (interestFilter === 'women' && p.gender !== 'female') {
      return false
    }
    if (interestFilter === 'men' && p.gender !== 'male') {
      return false
    }
    if (interestFilter === 'friends' && p.lookingFor !== 'friends') {
      return false
    }
    if (citySearch.trim() && !p.city.toLowerCase().includes(citySearch.toLowerCase().trim())) {
      return false
    }
    return true
  })

  // Preload upcoming images so the next card is already cached in memory
  useEffect(() => {
    if (filteredProfiles.length > 1 && filteredProfiles[1]?.photo1) {
      const img1 = new Image()
      img1.src = filteredProfiles[1].photo1
    }
    if (filteredProfiles.length > 2 && filteredProfiles[2]?.photo1) {
      const img2 = new Image()
      img2.src = filteredProfiles[2].photo1
    }
  }, [filteredProfiles])

  const currentTopProfile = filteredProfiles[0]

  // Keyboard navigation for desktop: Left arrow (Pass), Right arrow (Like)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return
      if (!currentTopProfile) return

      if (e.key === 'ArrowLeft') {
        handleSwipe(currentTopProfile.uid, 'pass')
      } else if (e.key === 'ArrowRight') {
        handleSwipe(currentTopProfile.uid, 'like')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentTopProfile, user, profile])

  const isCustomFiltered = selectedCountry !== 'all' || interestFilter !== 'all' || !!citySearch

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col items-center select-none bg-[#FAFAFA]">
      
      {/* Clean Badoo Top Header (Outside the Card) */}
      <header className="w-full max-w-[430px] flex items-center justify-between px-4 pt-3.5 pb-2 shrink-0 z-30">
        <h1 className="text-2xl sm:text-[28px] font-black text-[#1A1A2E] tracking-tight">
          Encounters
        </h1>

        <div className="flex items-center gap-2">
          {/* Boost Me Pill Button (Badoo Style) */}
          <button
            type="button"
            onClick={() => setShowBoostModal(true)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95 ${
              isBoosted
                ? 'bg-amber-400 text-black border border-amber-500 shadow-amber-200'
                : 'bg-black text-white hover:bg-neutral-800'
            }`}
            title="Super Boost Profile"
          >
            <Zap size={13} className={isBoosted ? 'fill-black stroke-black animate-bounce' : 'fill-white stroke-white'} />
            <span>{isBoosted ? `Boosted (${boostMinutesLeft}m)` : 'Boost Me'}</span>
          </button>

          {/* Sliders / Filter Icon Button (Badoo Style) */}
          <button
            type="button"
            onClick={() => setShowFilterModal(true)}
            className="relative p-2 rounded-full text-black hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
            title="Filter & Discovery Preferences"
          >
            <SlidersHorizontal size={22} strokeWidth={2.2} />
            {isCustomFiltered && (
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-[#FF385C] border-2 border-white"></span>
            )}
          </button>
        </div>
      </header>

      {/* Main Card Deck Area (Card takes remaining height, no page scrolling) */}
      <div className="flex-1 min-h-0 w-full max-w-[430px] flex items-center justify-center relative px-2.5 pb-2.5 sm:px-3 sm:pb-3">
        {loading ? (
          <div className="h-full w-full rounded-[28px] sm:rounded-[32px] bg-gray-900 border border-gray-800 shadow-xl animate-pulse flex flex-col justify-between p-6">
            <div className="h-8 w-44 bg-gray-800 rounded-lg mt-4"></div>
            <div className="h-16 w-64 mx-auto bg-gray-800 rounded-full mb-6"></div>
          </div>
        ) : filteredProfiles.length > 0 ? (
          <div className="relative w-full h-full">
            {/* Background Card (ALREADY LOADED BEHIND in DOM) */}
            {filteredProfiles.length > 1 && (
              <ProfileCard
                key={filteredProfiles[1].uid}
                profile={filteredProfiles[1]}
                onSwipe={(direction) => handleSwipe(filteredProfiles[1].uid, direction)}
                active={false}
              />
            )}

            {/* Foreground Active Card (Draggable horizontally, buttons swipe with pic) */}
            <ProfileCard
              key={filteredProfiles[0].uid}
              profile={filteredProfiles[0]}
              onSwipe={(direction) => handleSwipe(filteredProfiles[0].uid, direction)}
              active={true}
            />
          </div>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 bg-white rounded-[28px] sm:rounded-[32px] border border-gray-200/80 shadow-md">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-2xl border border-rose-100 relative">
              {selectedCountry !== 'all' ? (
                <CountryFlag country={selectedCountry} size="lg" />
              ) : (
                <Sparkles className="w-10 h-10 text-[#FF385C]" />
              )}
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white"></span>
            </div>
            
            <h2 className="text-xl font-black text-[#0F172A] mb-1 tracking-tight">
              No profiles matching your filters
            </h2>
            
            <p className="text-gray-500 text-xs mb-5 max-w-xs leading-relaxed">
              {interestFilter === 'friends'
                ? "No profiles looking for new friends with your current filters."
                : "You've viewed all profiles in this selection. Check back soon or widen your filters to discover more people!"}
            </p>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              {isCustomFiltered && (
                <button
                  onClick={() => {
                    setSelectedCountry('all')
                    setInterestFilter('all')
                    setCitySearch('')
                  }}
                  className="w-full py-2.5 bg-[#FF385C] text-white rounded-xl font-bold text-xs hover:bg-[#e03150] transition-colors shadow-xs cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
              <button
                onClick={loadProfiles}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-xs hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <RotateCcw size={14} /> Refresh Feed
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Boost Modal (Badoo Style) */}
      {showBoostModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-6 w-full max-w-sm shadow-2xl space-y-5 animate-in fade-in zoom-in-95 text-center relative">
            <button
              onClick={() => setShowBoostModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center mx-auto text-amber-500 shadow-md">
              <Zap size={32} className="fill-amber-400 stroke-amber-600" />
            </div>

            <div>
              <h3 className="text-xl font-black text-[#0F172A] tracking-tight">
                Super Boost Your Profile
              </h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Be seen first by hundreds of active singles in Algeria 🇩🇿, Morocco 🇲🇦, and Tunisia 🇹🇳. Get up to 5x more encounters!
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Priority placement in Encounters</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Highlighted with special badge</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Active for 30 minutes</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleActivateBoost}
              className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap size={16} className="fill-white" />
              <span>{isBoosted ? 'Extend Boost (+30m)' : 'Activate Boost for Free'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Preferences Modal Sheet (Filters hidden behind the sliders button) */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-6 w-full max-w-md shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#FF385C]" />
                <h3 className="font-bold text-[#0F172A] text-lg">Discovery Filters</h3>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Country Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Country
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedCountry('all')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                    selectedCountry === 'all'
                      ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span>🌍 All Maghreb</span>
                </button>

                <button
                  onClick={() => setSelectedCountry('algeria')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                    selectedCountry === 'algeria'
                      ? 'bg-[#FF385C] text-white border-[#FF385C] shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <CountryFlag country="algeria" size="xs" />
                  <span>Algeria</span>
                </button>

                <button
                  onClick={() => setSelectedCountry('morocco')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                    selectedCountry === 'morocco'
                      ? 'bg-[#FF385C] text-white border-[#FF385C] shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <CountryFlag country="morocco" size="xs" />
                  <span>Morocco</span>
                </button>

                <button
                  onClick={() => setSelectedCountry('tunisia')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                    selectedCountry === 'tunisia'
                      ? 'bg-[#FF385C] text-white border-[#FF385C] shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <CountryFlag country="tunisia" size="xs" />
                  <span>Tunisia</span>
                </button>
              </div>
            </div>

            {/* Who do you want to meet? */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                I want to meet
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'all', label: '✨ Everyone' },
                  { id: 'women', label: '👩 Women' },
                  { id: 'men', label: '👨 Men' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setInterestFilter(opt.id as any)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      interestFilter === opt.id
                        ? 'bg-[#FF385C] text-white border-[#FF385C] shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Looking For Goal */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Relationship Intent
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'Any Goal' },
                  { id: 'friends', label: '🤝 Friends' },
                  { id: 'dating', label: '💝 Dating' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (opt.id === 'friends') setInterestFilter('friends')
                      else setInterestFilter('all')
                    }}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      (opt.id === 'friends' && interestFilter === 'friends') || (opt.id === 'all' && interestFilter !== 'friends')
                        ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* City / Wilaya Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Filter by City / Wilaya
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="e.g. Algiers, Oran, Casablanca, Tunis..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#FF385C]"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setSelectedCountry('all')
                  setInterestFilter('all')
                  setCitySearch('')
                  setShowFilterModal(false)
                }}
                className="flex-1 py-3 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-3 text-xs font-bold text-white bg-[#FF385C] hover:bg-[#e03150] rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
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

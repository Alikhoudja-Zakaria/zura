'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getApprovedUsers, getSwipedUserIds, createSwipe, checkMutualLike, createMatch } from '@/lib/firestore'
import { UserProfile, Country } from '@/types'
import ProfileCard from '@/components/cards/ProfileCard'
import MatchModal from '@/components/cards/MatchModal'
import { CountryFlag } from '@/components/ui/CountryFlag'
import { 
  X, Heart, Star, RotateCcw, SlidersHorizontal, 
  Sparkles, ShieldCheck, MapPin, Users, Check, MessageCircle
} from 'lucide-react'
import Link from 'next/link'

export default function DiscoverPage() {
  const { user, profile } = useAuth()
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [selectedCountry, setSelectedCountry] = useState<'all' | Country>('all')
  const [interestFilter, setInterestFilter] = useState<'all' | 'women' | 'men' | 'friends'>('all')
  const [citySearch, setCitySearch] = useState('')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [matchData, setMatchData] = useState<{ user1: UserProfile; user2: UserProfile } | null>(null)

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

  return (
    <div className="h-full w-full overflow-hidden flex flex-col justify-between items-center select-none bg-[#FDFBF9]">
      
      {/* Top Filter Bar — Modern, Unified & Sleek */}
      <div className="w-full max-w-xl px-3 pt-2 pb-1 shrink-0 z-20 flex flex-col gap-1.5">
        
        {/* Country Selector (3 Buttons + All) */}
        <div className="flex items-center gap-1.5">
          <div className="flex-1 bg-white p-1 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between gap-1">
            <button
              onClick={() => setSelectedCountry('all')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                selectedCountry === 'all'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Maghreb
            </button>
            
            <button
              onClick={() => setSelectedCountry('algeria')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedCountry === 'algeria'
                  ? 'bg-[#FF385C] text-white shadow-xs font-black'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CountryFlag country="algeria" size="xs" />
              <span>Algeria</span>
            </button>

            <button
              onClick={() => setSelectedCountry('morocco')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedCountry === 'morocco'
                  ? 'bg-[#FF385C] text-white shadow-xs font-black'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CountryFlag country="morocco" size="xs" />
              <span>Morocco</span>
            </button>

            <button
              onClick={() => setSelectedCountry('tunisia')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedCountry === 'tunisia'
                  ? 'bg-[#FF385C] text-white shadow-xs font-black'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CountryFlag country="tunisia" size="xs" />
              <span>Tunisia</span>
            </button>
          </div>

          {/* Preferences Filter Button */}
          <button
            onClick={() => setShowFilterModal(true)}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center gap-1.5 ${
              interestFilter !== 'all' || citySearch
                ? 'bg-rose-50 border-[#FF385C] text-[#FF385C]'
                : 'bg-white border-gray-200/80 text-gray-600 hover:bg-gray-50'
            }`}
            title="Filters & Preferences"
          >
            <SlidersHorizontal size={17} />
            {(interestFilter !== 'all' || citySearch) && (
              <span className="h-2 w-2 rounded-full bg-[#FF385C]"></span>
            )}
          </button>
        </div>

        {/* Quick Filter Chips (1-tap access) */}
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => setInterestFilter('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
              interestFilter === 'all'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
            }`}
          >
            ✨ Everyone
          </button>

          <button
            onClick={() => setInterestFilter('women')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
              interestFilter === 'women'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
            }`}
          >
            👩 Women
          </button>

          <button
            onClick={() => setInterestFilter('men')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
              interestFilter === 'men'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
            }`}
          >
            👨 Men
          </button>

          <button
            onClick={() => setInterestFilter('friends')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              interestFilter === 'friends'
                ? 'bg-[#FF385C] text-white shadow-xs'
                : 'bg-white text-rose-600 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            🤝 New Friends
          </button>

          {citySearch && (
            <button
              onClick={() => setCitySearch('')}
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 flex items-center gap-1"
            >
              <span>📍 {citySearch}</span>
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area: Responsive 3-Column on Desktop, Focused on Mobile */}
      <div className="flex-1 w-full max-w-6xl flex justify-center items-center gap-6 px-4 min-h-0">
        
        {/* Desktop Left Rail — Solves "feels empty" by giving context and community activity */}
        <div className="hidden lg:flex flex-col w-[260px] gap-4 shrink-0 py-2">
          {/* My Profile Quick Glance */}
          <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 overflow-hidden shrink-0">
                {profile?.photo1 ? (
                  <img src={profile.photo1} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-rose-500 font-bold">Z</div>
                )}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-sm text-[#0F172A] truncate">{profile?.name || 'My Profile'}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                  <CountryFlag country={profile?.country || ''} size="xs" />
                  <span>{profile?.city || 'Algeria'}</span>
                </p>
              </div>
            </div>
            <Link
              href="/profile"
              className="block w-full py-2 text-center text-xs font-bold text-[#FF385C] bg-rose-50/70 hover:bg-rose-50 rounded-xl transition-colors"
            >
              View My Profile
            </Link>
          </div>

          {/* Quick Stats & Matches Teaser */}
          <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">Maghreb Activity</span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active now
              </span>
            </div>
            
            <Link
              href="/matches"
              className="p-3 rounded-2xl bg-gray-50 hover:bg-gray-100/80 border border-gray-100 flex items-center gap-3 transition-colors block"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FF385C] text-white flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0F172A]">Open Matches & Chat</p>
                <p className="text-[11px] text-gray-400">See your active connections</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Center Stage Card Deck (Strictly fits available height, zero outer scroll) */}
        <div className="flex-1 max-w-[400px] h-full min-h-0 relative my-1">
          {loading ? (
            <div className="h-full w-full rounded-3xl bg-white border border-gray-200 shadow-sm animate-pulse flex flex-col justify-end p-6">
              <div className="h-8 w-44 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
            </div>
          ) : filteredProfiles.length > 0 ? (
            filteredProfiles.slice(0, 3).reverse().map((p, index) => (
              <ProfileCard
                key={p.uid}
                profile={p}
                onSwipe={(direction) => handleSwipe(p.uid, direction)}
                active={index === Math.min(filteredProfiles.length, 3) - 1}
              />
            ))
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-gray-200/80 shadow-sm">
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
                {(selectedCountry !== 'all' || interestFilter !== 'all' || citySearch) && (
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

        {/* Desktop Right Rail — Trust, Guidelines & Verification */}
        <div className="hidden xl:flex flex-col w-[260px] gap-4 shrink-0 py-2">
          <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck size={18} />
              <span>Zura Safety First</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every profile on Zura requires 2 authentic photos and undergoes manual admin approval before joining.
            </p>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
              <span>Algeria • Morocco • Tunisia</span>
              <span>100% Free</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-50/50 to-orange-50/40 p-4 rounded-3xl border border-rose-100/80 text-xs space-y-2">
            <span className="font-bold text-[#8C4A1E] block">💡 Pro Tip</span>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              Tap the left or right of any photo to view pictures. Scroll inside the card to read prompts, languages, and full bio.
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Floating Action Dock (Docked neatly in viewport) */}
      <div className="w-full max-w-[340px] flex items-center justify-center gap-6 py-2 shrink-0 z-30">
        {/* Pass Button */}
        <button
          onClick={() => currentTopProfile && handleSwipe(currentTopProfile.uid, 'pass')}
          disabled={!currentTopProfile}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md border border-gray-200/90 text-rose-500 hover:bg-rose-50 hover:border-rose-200 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          title="Pass (Left Arrow)"
        >
          <X size={26} strokeWidth={2.8} />
        </button>

        {/* Superlike / Star Button */}
        <button
          onClick={() => currentTopProfile && handleSwipe(currentTopProfile.uid, 'like')}
          disabled={!currentTopProfile}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm border border-amber-200/80 text-amber-500 hover:bg-amber-50 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          title="Superlike"
        >
          <Star size={20} className="fill-amber-400 stroke-amber-500" />
        </button>

        {/* Like Button */}
        <button
          onClick={() => currentTopProfile && handleSwipe(currentTopProfile.uid, 'like')}
          disabled={!currentTopProfile}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF385C] shadow-lg shadow-[#FF385C]/35 text-white hover:bg-[#e03150] active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          title="Like (Right Arrow)"
        >
          <Heart size={30} className="fill-white" />
        </button>
      </div>

      {/* Full Preferences Modal Sheet */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#FF385C]" />
                <h3 className="font-bold text-[#0F172A] text-lg">Discovery Preferences</h3>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Who do you want to meet? */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Show Me
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
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
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
                  { id: 'friends', label: '🤝 New Friends' },
                  { id: 'dating', label: '💝 Dating' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (opt.id === 'friends') setInterestFilter('friends')
                      else setInterestFilter('all')
                    }}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
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

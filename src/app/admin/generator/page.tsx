'use client'

import React, { useState, useEffect } from 'react'
import { generateFakeProfiles, purgeGeneratedProfiles } from '@/lib/profileGenerator'
import { getAllUsers } from '@/lib/firestore'
import { UserProfile, Country } from '@/types'
import { CountryFlag } from '@/components/ui/CountryFlag'
import { 
  Sparkles, Users, Trash2, CheckCircle2, 
  Loader2, RefreshCw, AlertCircle, Eye, ArrowRight 
} from 'lucide-react'
import Link from 'next/link'

export default function AdminGeneratorPage() {
  const [count, setCount] = useState<number>(5)
  const [country, setCountry] = useState<'all' | Country>('all')
  const [gender, setGender] = useState<'mix' | 'female' | 'male'>('mix')
  const [status, setStatus] = useState<'approved' | 'pending'>('approved')

  const [loading, setLoading] = useState(false)
  const [purging, setPurging] = useState(false)
  const [message, setMessage] = useState('')
  const [recentlyCreated, setRecentlyCreated] = useState<UserProfile[]>([])
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [fakeCount, setFakeCount] = useState<number>(0)

  const loadStats = async () => {
    try {
      const all = await getAllUsers()
      setTotalUsers(all.length)
      const fakes = all.filter(u => u.uid.startsWith('fake_') || u.uid.startsWith('seed_'))
      setFakeCount(fakes.length)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const handleGenerate = async () => {
    setLoading(true)
    setMessage('')
    try {
      const created = await generateFakeProfiles({
        count,
        country,
        gender,
        status,
      })
      setRecentlyCreated(created)
      setMessage(`Successfully created ${created.length} realistic profiles! They are now saved to Firestore.`)
      await loadStats()
    } catch (err: any) {
      setMessage(`Error generating profiles: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePurge = async () => {
    if (!window.confirm("Are you sure you want to delete all generated fake and demo profiles? This will NOT delete real registered users.")) {
      return
    }
    setPurging(true)
    setMessage('')
    try {
      const deletedCount = await purgeGeneratedProfiles()
      setMessage(`Cleaned up ${deletedCount} generated test profiles.`)
      setRecentlyCreated([])
      await loadStats()
    } catch (err: any) {
      setMessage(`Error purging profiles: ${err.message}`)
    } finally {
      setPurging(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 text-[#FF385C]">
              <Sparkles size={24} />
            </div>
            <h1 className="text-2xl font-black text-[#1A1A2E]">Profile Generator</h1>
          </div>
          <p className="text-gray-500 text-xs mt-1">
            Instantly generate realistic Algerian, Moroccan, and Tunisian profiles with authentic names, wilayas, cultural prompts, and photos.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Total Users</div>
            <div className="text-lg font-black text-[#1A1A2E]">{totalUsers}</div>
          </div>
          <div className="h-7 w-px bg-gray-200"></div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Generated</div>
            <div className="text-lg font-black text-[#FF385C]">{fakeCount}</div>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{message}</span>
          </div>
          <Link
            href="/discover"
            className="text-xs font-bold text-emerald-700 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 hover:bg-emerald-50 flex items-center gap-1"
          >
            <span>View on Discover</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Generator Configuration Form */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
          Generator Options
        </h2>

        {/* Number of Profiles */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2">
            Number of Profiles to Create
          </label>
          <div className="flex flex-wrap gap-2">
            {[1, 3, 5, 10, 20].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setCount(num)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  count === num
                    ? 'bg-[#FF385C] text-white border-[#FF385C] shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {num} {num === 1 ? 'Profile' : 'Profiles'}
              </button>
            ))}
          </div>
        </div>

        {/* Country Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2">
            Target Country
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setCountry('all')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                country === 'all'
                  ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>🌍 Random Mix</span>
            </button>
            <button
              type="button"
              onClick={() => setCountry('algeria')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                country === 'algeria'
                  ? 'bg-[#FF385C] text-white border-[#FF385C] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <CountryFlag country="algeria" size="xs" />
              <span>Algeria 🇩🇿</span>
            </button>
            <button
              type="button"
              onClick={() => setCountry('morocco')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                country === 'morocco'
                  ? 'bg-[#FF385C] text-white border-[#FF385C] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <CountryFlag country="morocco" size="xs" />
              <span>Morocco 🇲🇦</span>
            </button>
            <button
              type="button"
              onClick={() => setCountry('tunisia')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                country === 'tunisia'
                  ? 'bg-[#FF385C] text-white border-[#FF385C] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <CountryFlag country="tunisia" size="xs" />
              <span>Tunisia 🇹🇳</span>
            </button>
          </div>
        </div>

        {/* Gender Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Gender Distribution
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setGender('mix')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  gender === 'mix'
                    ? 'bg-[#0F172A] text-white border-[#0F172A]'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                50/50 Mix
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  gender === 'female'
                    ? 'bg-[#FF385C] text-white border-[#FF385C]'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                👩 Female
              </button>
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  gender === 'male'
                    ? 'bg-[#0F172A] text-white border-[#0F172A]'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                👨 Male
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Account Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('approved')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  status === 'approved'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                ✅ Approved (Instant Discover)
              </button>
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  status === 'pending'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                ⏳ Pending (For Review Queue)
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#FF385C] hover:bg-[#e03150] text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            <span>Generate {count} Profiles Now</span>
          </button>

          {fakeCount > 0 && (
            <button
              type="button"
              onClick={handlePurge}
              disabled={purging}
              className="w-full sm:w-auto px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-red-200 disabled:opacity-50 cursor-pointer"
            >
              {purging ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              <span>Purge All Generated Profiles ({fakeCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Recently Created Profiles Grid */}
      {recentlyCreated.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700">
              Recently Created Batch ({recentlyCreated.length})
            </h2>
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-[#FF385C] hover:underline"
            >
              View in Users table →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recentlyCreated.map((p) => (
              <div
                key={p.uid}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200/80"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 shrink-0 border border-gray-200">
                  <img
                    src={p.photo1}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-[#1A1A2E] truncate">{p.name}, {p.age}</span>
                    <CountryFlag country={p.country} size="xs" />
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">{p.city} • {p.profession}</div>
                  <span className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    p.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

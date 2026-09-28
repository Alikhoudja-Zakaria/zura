'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Compass, Heart, MessageCircle, User } from 'lucide-react'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      if (!user || !profile) {
        router.push('/login')
      } else if (profile.status !== 'approved') {
        router.push('/pending')
      }
    }
  }, [user, profile, loading, router])

  if (loading || !user || !profile || profile.status !== 'approved') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FF4458] border-t-transparent"></div>
      </div>
    )
  }

  const isChatRoom = pathname.startsWith('/chat/') && pathname !== '/chat'
  const isDiscover = pathname === '/discover'

  const navItems = [
    { name: 'Discover', href: '/discover', icon: Compass },
    { name: 'Matches', href: '/matches', icon: Heart },
    { name: 'Chat', href: '/matches', icon: MessageCircle },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <div className={`flex h-[100dvh] flex-col bg-[#FDFBF9] overflow-hidden ${isDiscover ? 'overscroll-none touch-none select-none' : ''}`}>
      {/* Top Header (Hidden in chat rooms & discover) */}
      {!isChatRoom && !isDiscover && (
        <header className="flex h-14 items-center justify-between px-4 sm:px-6 md:hidden bg-white border-b border-gray-100 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-[#FF385C]">ZURA</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-[#FF385C] border border-rose-100 font-sans">
              زورة
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Maghreb</span>
          </div>
        </header>
      )}

      {/* Main Content — strictly overflow-hidden on Discover so outer page CANNOT scroll */}
      <main className={`flex-1 ${isDiscover ? 'overflow-hidden overscroll-none touch-none' : 'overflow-y-auto'} ${isChatRoom ? 'pb-0' : 'pb-16'} md:pb-0 md:pl-20 min-h-0`}>
        {children}
      </main>

      {/* Bottom Navigation (Mobile, Hidden in chat rooms) */}
      {!isChatRoom && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-white px-4 md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center p-2 transition-all ${
                  isActive ? 'text-[#FF385C] font-semibold scale-105' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <item.icon size={23} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
                <span className="mt-1 text-[10px] font-medium tracking-tight">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      )}

      {/* Side Navigation (Desktop) */}
      <nav className="fixed bottom-0 left-0 top-0 hidden w-20 flex-col items-center justify-between border-r border-gray-100 bg-white py-6 md:flex shadow-xs z-50">
        <div className="flex flex-col items-center">
          <div className="font-black text-[#FF385C] text-xl tracking-tighter">ZURA</div>
          <div className="text-[10px] font-bold text-gray-400 mt-0.5">زورة</div>
        </div>

        <div className="flex w-full flex-col gap-6">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex w-full justify-center p-3 transition-all ${
                  isActive ? 'text-[#FF385C]' : 'text-gray-400 hover:text-gray-600'
                }`}
                title={item.name}
              >
                <div className={`p-2.5 rounded-2xl transition-all ${isActive ? 'bg-rose-50 text-[#FF385C] shadow-xs' : 'group-hover:bg-gray-50'}`}>
                  <item.icon size={26} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
                </div>
              </Link>
            )
          })}
        </div>

        <div className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase">
          DZ•MA•TN
        </div>
      </nav>
    </div>
  )
}

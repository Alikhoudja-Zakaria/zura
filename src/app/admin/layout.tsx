'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, ClipboardCheck, Users, Flag, LogOut } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Reviews', href: '/admin/reviews', icon: ClipboardCheck },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Reports', href: '/admin/reports', icon: Flag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userProfile, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && pathname !== '/admin/setup') {
      if (!userProfile) {
        router.push('/login');
      } else if (userProfile.role !== 'admin') {
        router.push('/discover');
      }
    }
  }, [userProfile, loading, router, pathname]);

  if (pathname === '/admin/setup') {
    return <div className="min-h-screen bg-[#FAFAFA]">{children}</div>;
  }

  if (loading || userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF4458]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row text-[#1A1A2E]">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-[250px] bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#FF4458]">Zura Admin</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-[#FF4458] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={async () => {
              await logout();
              router.push('/login');
            }}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Nav Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
                isActive ? 'text-[#FF4458]' : 'text-gray-500'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

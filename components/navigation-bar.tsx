"use client"
import Link from 'next/link'
import Image from 'next/image'
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer"
import { Menu } from "lucide-react"
import { useAuth } from './AuthProvider';
import { Button } from './ui/button';
import { useState } from 'react';
import { AuthModal } from './ui/AuthModal';

function NavigationBar() {
  const { user, isGuest, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gray-950/90 border-b border-gray-800 shadow-sm backdrop-blur flex items-center justify-between px-4 h-14 md:px-6 md:h-16" role="navigation" aria-label="Main Navigation">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded" aria-label="Home">
          <Image src="/placeholder-logo.svg" alt="FitFlow Logo" width={28} height={28} className="md:w-8 md:h-8" />
          <span className="font-bold text-lg md:text-xl text-white tracking-tight">FitFlow</span>
        </Link>
      </div>
      {/* Center: Navigation Links (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-6">
        <Link href="/workouts" className="text-white font-medium hover:text-green-400 transition focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Workouts">Workouts</Link>
        <Link href="/progress" className="text-white font-medium hover:text-green-400 transition focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Progress">Progress</Link>
        <span className="text-gray-500 font-medium cursor-not-allowed opacity-60 select-none min-w-[44px] min-h-[44px] flex items-center justify-center" aria-disabled="true">Community</span>
      </div>
      {/* Mobile: Hamburger menu */}
      <div className="md:hidden flex items-center">
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <button
              aria-label="Open navigation menu"
              className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              onClick={() => setDrawerOpen(true)}
              tabIndex={0}
              type="button"
            >
              <Menu className="h-7 w-7 text-cyan-400" />
            </button>
          </DrawerTrigger>
          <DrawerContent className="bg-gray-950 border-t border-cyan-700/30 text-white">
            <div className="flex flex-col gap-4 py-6 px-4">
              <Link href="/workouts" className="text-white font-medium hover:text-green-400 transition focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded min-h-[44px] flex items-center" aria-label="Workouts" onClick={() => setDrawerOpen(false)}>
                Workouts
              </Link>
              <Link href="/progress" className="text-white font-medium hover:text-green-400 transition focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded min-h-[44px] flex items-center" aria-label="Progress" onClick={() => setDrawerOpen(false)}>
                Progress
              </Link>
              <span className="text-gray-500 font-medium cursor-not-allowed opacity-60 select-none min-h-[44px] flex items-center" aria-disabled="true">Community</span>
              <hr className="border-cyan-700/20 my-2" />
              {isGuest ? (
                <Button size="lg" variant="outline" className="border-cyan-700 text-cyan-300 hover:bg-cyan-900/40 w-full" onClick={() => { setAuthOpen(true); setDrawerOpen(false); }}>
                  Login
                </Button>
              ) : (
                <Button size="lg" variant="outline" className="border-cyan-700 text-cyan-300 hover:bg-cyan-900/40 w-full" onClick={() => { logout(); setDrawerOpen(false); }}>
                  Logout
                </Button>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
      {/* Right: User menu (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-4">
        {isGuest ? (
          <>
            <span className="text-cyan-300 font-medium">Guest</span>
            <Button size="sm" variant="outline" className="border-cyan-700 text-cyan-300 hover:bg-cyan-900/40 min-w-[44px] min-h-[44px]" onClick={() => setAuthOpen(true)}>
              Login
            </Button>
            <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
          </>
        ) : (
          <>
            <span className="text-cyan-300 font-medium">{user?.email}</span>
            <Button size="sm" variant="outline" className="border-cyan-700 text-cyan-300 hover:bg-cyan-900/40 min-w-[44px] min-h-[44px]" onClick={logout}>
              Logout
            </Button>
          </>
        )}
      </div>
      {/* Auth Modal for mobile */}
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </nav>
  );
}

export default NavigationBar; 
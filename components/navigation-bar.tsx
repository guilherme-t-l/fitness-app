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
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gray-950/90 border-b border-gray-800 shadow-sm backdrop-blur flex items-center justify-between px-4 h-14 md:px-6 md:h-16">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <Image src="/placeholder-logo.svg" alt="FitFlow Logo" width={28} height={28} className="md:w-8 md:h-8" />
          <span className="font-bold text-lg md:text-xl text-white tracking-tight">FitFlow</span>
        </Link>
      </div>
      {/* Center: Navigation Links (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-6">
        <Link href="/workouts" className="text-white font-medium hover:text-green-400 transition">Workouts</Link>
        <Link href="/progress" className="text-white font-medium hover:text-green-400 transition">Progress</Link>
        <span className="text-gray-500 font-medium cursor-not-allowed opacity-60 select-none">Community</span>
      </div>
      {/* Right: User menu */}
      <div className="flex items-center gap-4">
        {isGuest ? (
          <>
            <span className="text-cyan-300 font-medium">Guest</span>
            <Button size="sm" variant="outline" className="border-cyan-700 text-cyan-300 hover:bg-cyan-900/40" onClick={() => setAuthOpen(true)}>
              Login
            </Button>
            <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
          </>
        ) : (
          <>
            <span className="text-cyan-300 font-medium">{user?.email}</span>
            <Button size="sm" variant="outline" className="border-cyan-700 text-cyan-300 hover:bg-cyan-900/40" onClick={logout}>
              Logout
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}

export default NavigationBar; 
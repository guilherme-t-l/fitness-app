"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react';
import { AuthModal } from '@/components/ui/AuthModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const [authOpen, setAuthOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle Supabase auth redirect tokens or errors in the URL hash
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      const error = params.get('error');
      const error_code = params.get('error_code');
      const error_description = params.get('error_description');
      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token }).then(() => {
          window.location.hash = '';
          router.replace('/workouts');
        });
      } else if (error) {
        // Redirect to /auth/callback with error details as query params
        router.replace(`/auth/callback?error=${encodeURIComponent(error)}&error_code=${encodeURIComponent(error_code || '')}&error_description=${encodeURIComponent(error_description || '')}`);
      }
    }
  }, [router]);

  useEffect(() => {
    if (searchParams.get('login') === '1') {
      setAuthOpen(true);
    }
  }, [searchParams]);
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 text-white relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-700 opacity-30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 right-0 w-96 h-96 bg-cyan-500 opacity-20 rounded-full blur-3xl animate-pulse" />
      <div className="z-10 flex flex-col items-center gap-8 w-full px-4 md:px-0">
        <Image src="/placeholder-logo.svg" alt="FitFlow Logo" width={96} height={96} className="mb-2 animate-bounce drop-shadow-lg" />
        <h1 className="text-5xl md:text-6xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text drop-shadow-xl">Welcome to FitFlow</h1>
        <p className="text-gray-200 mb-4 text-center text-2xl font-medium max-w-2xl drop-shadow">Your smart fitness companion. Start your journey:</p>
        {/* Feature highlights */}
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center">
          <div className="flex items-center gap-3 text-cyan-300 text-lg"><span className="text-2xl">💪</span> Track & edit custom workouts</div>
          <div className="flex items-center gap-3 text-purple-300 text-lg"><span className="text-2xl">📈</span> Visualize your progress</div>
          <div className="flex items-center gap-3 text-green-300 text-lg"><span className="text-2xl">⚡</span> Fast, modern, and easy to use</div>
        </div>
        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-md mx-auto mt-6">
          <button
            onClick={() => setAuthOpen(true)}
            className="flex-1 min-h-[56px] flex flex-col items-center justify-center rounded-xl text-lg font-semibold shadow-lg border border-cyan-500/40 bg-gradient-to-r from-cyan-900 to-cyan-700 text-cyan-200 hover:from-cyan-800 hover:to-cyan-600 hover:scale-105 transition-all"
          >
            <span className="font-semibold text-lg">Login / Sign Up</span>
            <span className="text-sm text-cyan-300 mt-1">(secure your data)</span>
          </button>
          <Link
            href="/workouts"
            className="flex-1 min-h-[56px] flex items-center justify-center rounded-xl text-lg font-semibold shadow-lg border border-cyan-500/40 bg-gradient-to-r from-green-500 to-cyan-500 text-white text-center hover:from-green-600 hover:to-cyan-600 hover:scale-105 transition-all"
          >
            Use as Guest
          </Link>
          <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
        </div>
      </div>
    </main>
  )
} 
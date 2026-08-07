"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react';
import { AuthModal } from '@/components/ui/AuthModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [authOpen, setAuthOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

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
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Full-bleed warm stone atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 90% 60% at 50% 0%, hsl(38 30% 88% / 0.9), transparent 55%),
            radial-gradient(ellipse 50% 40% at 10% 80%, hsl(95 14% 86% / 0.45), transparent 50%),
            radial-gradient(ellipse 40% 35% at 90% 70%, hsl(30 22% 88% / 0.4), transparent 45%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="w-full max-w-xl text-center flex flex-col items-center gap-8">
        <p className="font-display text-5xl sm:text-6xl md:text-7xl tracking-tight text-foreground animate-fade-rise">
          FitFlow
        </p>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-normal text-foreground/90 leading-snug animate-fade-rise-delay">
          Your workouts, in one place.
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-md animate-fade-rise-delay-2">
          Build routines, run sessions, and track what you’ve done.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-2 animate-fade-rise-delay-2">
          <Button
            size="lg"
            className="min-h-[48px] px-8 text-base"
            onClick={() => setAuthOpen(true)}
          >
            Login / Sign Up
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="min-h-[48px] px-8 text-base"
            asChild
          >
            <Link href="/workouts">Use as Guest</Link>
          </Button>
        </div>
      </div>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  )
}

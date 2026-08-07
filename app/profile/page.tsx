"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { isGuest } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isGuest) {
      router.replace('/?login=1');
    }
  }, [isGuest, router]);

  if (isGuest) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-live="polite">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
        <span className="text-muted-foreground text-sm">Redirecting to sign in…</span>
      </div>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-16" role="main" aria-label="Profile Page">
      <h1 className="font-display text-4xl font-normal tracking-tight text-foreground mb-4" tabIndex={0}>
        Profile
      </h1>
      <p className="text-muted-foreground text-base leading-relaxed">
        Account settings are coming soon — email, password, avatar, and more.
      </p>
    </main>
  );
}

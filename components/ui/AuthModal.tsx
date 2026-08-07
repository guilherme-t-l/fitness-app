"use client"
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

export function AuthModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { login, signup, loading, isGuest, user, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  if (!isGuest && user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-popover border-border max-w-md w-full gap-6">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-medium text-foreground text-center">
              You’re already logged in
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Head back to your workouts, or log out.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 w-full">
            <Button
              className="w-full min-h-[44px]"
              onClick={() => {
                onOpenChange(false);
                setTimeout(() => {
                  router.replace('/workouts');
                }, 150);
              }}
            >
              Return to my account
            </Button>
            <Button
              className="w-full min-h-[44px]"
              onClick={async () => {
                await logout();
                onOpenChange(false);
              }}
              variant="outline"
            >
              Log out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (mode === 'login') {
      const { error } = await login(email, password) as any;
      if (error) setError(error.message || 'Login failed');
      else {
        if (typeof window !== 'undefined') {
          if (window.location.pathname === '/') {
            router.replace('/workouts');
          }
        }
        onOpenChange(false);
      }
    } else {
      const { error } = await signup(email, password) as any;
      if (error) setError(error.message || 'Signup failed');
      else setSuccess('Check your email to confirm your account.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-medium text-foreground">
            {mode === 'login' ? 'Login to FitFlow' : 'Sign up for FitFlow'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === 'login'
              ? 'Sign in to save and sync your workouts.'
              : 'Create an account to keep your workouts across devices.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            aria-label="Email address"
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            aria-label="Password"
            autoComplete="current-password"
          />
          {error && <div className="text-destructive text-sm" role="alert">{error}</div>}
          {success && <div className="text-primary text-sm" role="status">{success}</div>}
          <Button type="submit" className="w-full min-h-[44px]" disabled={loading} aria-label={mode === 'login' ? 'Login' : 'Sign Up'}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Sign up'}
          </Button>
        </form>
        <div className="text-center mt-2">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm min-h-[44px] px-2 transition-colors"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
              setSuccess(null);
            }}
            aria-label={mode === 'login' ? 'Switch to Sign Up' : 'Switch to Login'}
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

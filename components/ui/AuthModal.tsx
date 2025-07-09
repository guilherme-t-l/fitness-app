import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { useAuth } from '@/components/AuthProvider';

export function AuthModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { login, signup, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (mode === 'login') {
      const { error } = await login(email, password) as any;
      if (error) setError(error.message || 'Login failed');
      else onOpenChange(false);
    } else {
      const { error } = await signup(email, password) as any;
      if (error) setError(error.message || 'Signup failed');
      else setSuccess('Check your email to confirm your account!');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-cyan-700/40 text-white max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 text-2xl font-bold mb-2">
            {mode === 'login' ? 'Login to FitFlow' : 'Sign Up for FitFlow'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="bg-gray-800 border-cyan-700/30 text-white"
            autoFocus
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="bg-gray-800 border-cyan-700/30 text-white"
          />
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {success && <div className="text-green-400 text-sm">{success}</div>}
          <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700" disabled={loading}>
            {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </Button>
        </form>
        <div className="text-center mt-4">
          <button
            type="button"
            className="text-cyan-400 hover:underline text-sm"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
              setSuccess(null);
            }}
          >
            {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
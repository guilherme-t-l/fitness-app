"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function ProfilePage() {
  const { isGuest } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isGuest) {
      // Redirect to homepage and open login modal (by setting a query param)
      router.replace('/?login=1');
    }
  }, [isGuest, router]);

  if (isGuest) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite">
        <svg className="animate-spin h-8 w-8 text-cyan-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
        <span className="text-cyan-300 text-lg">Redirecting to login...</span>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4" role="main" aria-label="Profile Page">
      <h1 className="text-3xl font-bold mb-4 text-cyan-400" tabIndex={0}>Profile</h1>
      <p className="text-gray-300 text-base md:text-lg text-center max-w-md">This is your profile page. (Coming soon: update email, password, avatar, delete account...)</p>
    </main>
  );
} 
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
    return null; // Or a loading spinner
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-cyan-400">Profile</h1>
      <p className="text-gray-300">This is your profile page. (Coming soon: update email, password, avatar, delete account...)</p>
    </div>
  );
} 
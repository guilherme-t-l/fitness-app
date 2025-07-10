"use client"

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/workouts");
    }, 3000);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 text-white">
      <div className="bg-gray-900/80 rounded-xl p-8 shadow-lg border border-cyan-500/30 max-w-md w-full text-center">
        {error ? (
          <>
            <h1 className="text-3xl font-bold text-red-400 mb-2">Authentication Error</h1>
            <p className="text-lg text-red-200 mb-4">{errorDescription || "An unknown error occurred."}</p>
            <p className="text-gray-400 text-sm">You will be redirected to your workouts in a moment...</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-cyan-400 mb-2">Email Confirmed!</h1>
            <p className="text-lg text-cyan-200 mb-4">Your email has been successfully confirmed. You can now use all features.</p>
            <p className="text-gray-400 text-sm">Redirecting to your workouts...</p>
          </>
        )}
      </div>
    </div>
  );
} 
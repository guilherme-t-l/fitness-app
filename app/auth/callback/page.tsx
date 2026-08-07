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
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="max-w-md w-full text-center space-y-3">
        {error ? (
          <>
            <h1 className="font-display text-3xl font-normal text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">{errorDescription || "An unknown error occurred."}</p>
            <p className="text-muted-foreground/70 text-xs pt-2">Redirecting to your workouts…</p>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl font-normal text-foreground">Email confirmed</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your account is ready. Taking you to your workouts.
            </p>
            <p className="text-muted-foreground/70 text-xs pt-2">Redirecting…</p>
          </>
        )}
      </div>
    </div>
  );
}

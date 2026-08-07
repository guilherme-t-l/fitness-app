"use client"

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const [status, setStatus] = useState<"working" | "ok" | "error">(
    error ? "error" : "working"
  );
  const [message, setMessage] = useState(
    errorDescription || (error ? "An unknown error occurred." : "Confirming your email…")
  );

  useEffect(() => {
    let cancelled = false;
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    const goWorkouts = (delayMs = 1500) => {
      redirectTimer = setTimeout(() => {
        router.replace("/workouts");
      }, delayMs);
    };

    const establishSession = async () => {
      if (error) {
        setStatus("error");
        goWorkouts(3000);
        return;
      }

      try {
        // PKCE / code exchange (?code=…)
        const code = searchParams.get("code");
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          if (!cancelled) {
            setStatus("ok");
            setMessage("Your email has been confirmed. Redirecting…");
          }
          goWorkouts();
          return;
        }

        // Implicit hash tokens (#access_token=…&refresh_token=…)
        if (typeof window !== "undefined" && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const access_token = hashParams.get("access_token");
          const refresh_token = hashParams.get("refresh_token");
          const hashError = hashParams.get("error");
          const hashErrorDescription = hashParams.get("error_description");

          if (hashError) {
            if (!cancelled) {
              setStatus("error");
              setMessage(hashErrorDescription || hashError);
            }
            goWorkouts(3000);
            return;
          }

          if (access_token && refresh_token) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (sessionError) throw sessionError;
            window.location.hash = "";
            if (!cancelled) {
              setStatus("ok");
              setMessage("Your email has been confirmed. Redirecting…");
            }
            goWorkouts();
            return;
          }
        }

        // Already signed in (e.g. confirmation opened while session exists)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          if (!cancelled) {
            setStatus("ok");
            setMessage("You are signed in. Redirecting…");
          }
          goWorkouts();
          return;
        }

        if (!cancelled) {
          setStatus("ok");
          setMessage("Email confirmed. You can sign in now. Redirecting…");
        }
        goWorkouts();
      } catch (err: any) {
        if (!cancelled) {
          setStatus("error");
          setMessage(err?.message || "Could not complete authentication.");
        }
        goWorkouts(3000);
      }
    };

    void establishSession();

    return () => {
      cancelled = true;
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [error, router, searchParams]);

  const isError = status === "error";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-6">
      <div className="rounded-xl p-8 border border-border max-w-md w-full text-center bg-card">
        <h1 className={`text-2xl font-display mb-2 ${isError ? "text-destructive" : "text-foreground"}`}>
          {isError ? "Authentication Error" : status === "working" ? "Confirming…" : "Email Confirmed"}
        </h1>
        <p className="text-muted-foreground mb-4">{message}</p>
        <p className="text-muted-foreground text-sm">You will be redirected to your workouts shortly…</p>
      </div>
    </div>
  );
}

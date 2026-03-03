"use client";
import { useState, useEffect } from 'react';
import { getSupabaseBrowser } from '@/lib/supabaseBrowser';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  // Start loading=true always — we set it false only after we have a definitive answer
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      console.error('[useAuth] Supabase browser client is null — check NEXT_PUBLIC_ env vars');
      setLoading(false);
      return;
    }

    // Get initial session — this reads from localStorage so it's fast
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[useAuth] Initial session:', session ? `user=${session.user.email}` : 'none');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes (sign-in, sign-out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[useAuth] Auth state change:', event, session ? `user=${session.user.email}` : 'none');
      setSession(session);
      setUser(session?.user ?? null);
      // Don't set loading=false here if already false — avoids flicker on token refresh
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading };
}


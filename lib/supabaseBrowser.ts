/**
 * Browser-side Supabase client
 * Used only in "use client" components.
 * Reads NEXT_PUBLIC_ env vars which are safe to expose to the browser.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient | null {
    if (typeof window === 'undefined') return null; // SSR guard
    if (_client) return _client;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
        return null;
    }

    _client = createClient(url, key);
    return _client;
}

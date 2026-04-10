import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null
let cacheMode: 'service' | 'anon' | null = null

/**
 * Server-only Supabase client for Route Handlers.
 *
 * Prefer `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (Dashboard → Settings → API → service_role).
 * That key bypasses RLS so inserts from this API succeed without extra policies.
 *
 * If unset, falls back to `NEXT_PUBLIC_SUPABASE_ANON_KEY` — then RLS policies + GRANTs must allow INSERT (see docs).
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  const key = serviceKey || anonKey
  const mode: 'service' | 'anon' = serviceKey ? 'service' : 'anon'

  if (!url || !key) return null

  if (!cached || cacheMode !== mode) {
    cached = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    cacheMode = mode
  }
  return cached
}

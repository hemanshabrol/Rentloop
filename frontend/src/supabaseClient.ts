// ============================================================================
// FILE: supabaseClient.ts
// Purpose: Initializes the Supabase client using environment variables from
//          frontend/.env.local and provides a simple session hook for auth state.
// ============================================================================

import { createClient, Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in frontend/.env.local.'
  );
}

// Single shared Supabase client instance (uses only the public/publishable key)
export const supabase = createClient(supabaseUrl, supabasePublishableKey);

// Ensures the redirect query parameter is a valid internal path, defaulting to /dashboard/owner
export function getSafeRedirectPath(rawRedirect: string | null): string {
  if (rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')) {
    return rawRedirect;
  }
  return '/dashboard/owner';
}

// Tracks the current Supabase Auth session across page refreshes and login/logout events
export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Load existing session from local storage on initial page load / refresh
    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
        setIsLoading(false);
      }
    });

    // 2. Listen for sign-in, sign-out, and token refresh events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, updatedSession) => {
      if (isMounted) {
        setSession(updatedSession);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, isLoading };
}


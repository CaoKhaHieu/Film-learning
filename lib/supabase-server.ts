import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // This can be ignored if you have middleware refreshing sessions
          }
        },
      },
    }
  )
}

// Database types
export type Movie = {
  id: string;
  tmdb_id: number | null;
  title: string;
  title_vi: string | null;
  overview: string | null;
  description: string | null; // Keep for backward compatibility if needed, though we renamed it in schema
  poster: string | null;
  background_image: string | null;
  release_date: string | null;
  runtime: number | null;
  vote_average: number | null;
  genres: string | null;
  video_url: string | null;
  is_vip: boolean;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | null;
  created_at: string;
};

export type Subtitle = {
  id: string;
  movie_id: string;
  language: 'en' | 'vi';
  url: string;
  created_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan: 'free' | 'vip';
  start_date: string;
  end_date: string | null;
  status: 'active' | 'canceled' | 'expired';
  created_at: string;
};
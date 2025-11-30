import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export type Movie = {
  id: string
  title: string
  original_title: string | null
  slug: string
  type: 'movie' | 'series'
  description: string | null
  poster_url: string | null
  backdrop_url: string | null
  trailer_url: string | null
  release_year: number | null
  duration: number | null
  imdb_rating: number | null
  age_rating: string | null
  country: string | null
  language: string | null
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | null
  is_featured: boolean
  is_published: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export type Genre = {
  id: string
  name: string
  slug: string
  created_at: string
}

export type MovieWithGenres = Movie & {
  genres: string[] | null
  genre_slugs: string[] | null
}

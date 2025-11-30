import { type Movie } from '@/lib/supabase-server';

// Types for transformed data
export interface MovieRowData {
  id: string;
  title: string;
  image: string;
  isNew: boolean;
  quality: string;
  year: string;
}

export interface Top10MovieData {
  id: string;
  title: string;
  image: string;
  rank: number;
}

// Transform functions (not server actions)
export function transformMovieForRow(movie: Movie): MovieRowData {
  return {
    id: movie.id,
    title: movie.title,
    image: movie.poster || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=500&q=60",
    isNew: false,
    quality: movie.is_vip ? "VIP" : "HD",
    year: new Date(movie.created_at).getFullYear().toString(),
  };
}

export function transformMovieForTop10(movie: Movie, rank: number): Top10MovieData {
  return {
    id: movie.id,
    title: movie.title,
    image: movie.poster || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=500&q=60",
    rank: rank,
  };
}

// Get difficulty level label
export function getDifficultyLabel(difficultyLevel: string | null): string {
  const difficultyLabels: Record<string, string> = {
    beginner: 'Cơ Bản',
    intermediate: 'Trung Cấp',
    advanced: 'Nâng Cao',
  };
  
  return difficultyLevel 
    ? difficultyLabels[difficultyLevel] || difficultyLevel 
    : 'Chưa xác định';
}
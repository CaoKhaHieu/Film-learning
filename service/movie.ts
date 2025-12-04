"use server";

import { createClient, type Movie } from '@/lib/supabase-server';
import {
  transformMovieForRow,
  transformMovieForTop10,
  getDifficultyLabel,
  type MovieRowData,
  type Top10MovieData
} from './movie-utils';

// Service functions for movie data fetching

/**
 * Get movies by difficulty level with optional limit
 */
export async function getMoviesByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  limit?: number
): Promise<Movie[]> {
  const supabase = await createClient();

  let query = supabase
    .from('movies')
    .select('*')
    .eq('difficulty_level', difficulty);

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching ${difficulty} movies:`, error);
    return [];
  }

  return data || [];
}

/**
 * Get latest movies for homepage
 */
export async function getLatestMovies(limit: number = 10): Promise<Movie[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest movies:', error);
    return [];
  }

  return data || [];
}

/**
 * Get movie by ID
 */
export async function getMovieById(id: string): Promise<Movie | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching movie by ID:', error);
    return null;
  }

  return data;
}

/**
 * Get related movies (same difficulty level, excluding current movie)
 */
export async function getRelatedMovies(
  currentMovieId: string,
  difficultyLevel: string | null,
  limit: number = 10
): Promise<Movie[]> {
  if (!difficultyLevel) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('difficulty_level', difficultyLevel)
    .neq('id', currentMovieId)
    .limit(limit);

  if (error) {
    console.error('Error fetching related movies:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all movies by difficulty level (for level pages)
 */
export async function getAllMoviesByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): Promise<Movie[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('difficulty_level', difficulty)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching all ${difficulty} movies:`, error);
    return [];
  }

  return data || [];
}

/**
 * Search movies by title
 */
export async function searchMovies(query: string, limit: number = 10): Promise<Movie[]> {
  if (!query.trim()) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .ilike('title', `%${query}%`)
    .limit(limit);

  if (error) {
    console.error('Error searching movies:', error);
    return [];
  }

  return data || [];
}

/**
 * Get movies for homepage with all categories
 */
export async function getHomepageMovies() {
  const [beginnerMovies, intermediateMovies, advancedMovies, latestMovies] = await Promise.all([
    getMoviesByDifficulty('beginner', 10),
    getMoviesByDifficulty('intermediate', 10),
    getMoviesByDifficulty('advanced', 10),
    getLatestMovies(5)
  ]);

  return {
    beginnerMovies: beginnerMovies.map(transformMovieForRow),
    intermediateMovies: intermediateMovies.map(transformMovieForRow),
    advancedMovies: advancedMovies.map(transformMovieForRow),
    topMovies: latestMovies.map((movie, index) => transformMovieForTop10(movie, index + 1))
  };
}

/**
 * Get movie details with related movies
 */
export async function getMovieDetails(id: string) {
  const movie = await getMovieById(id);

  if (!movie) {
    return null;
  }

  const relatedMovies = await getRelatedMovies(id, movie.difficulty_level, 10);

  return {
    movie,
    relatedMovies: relatedMovies.map(transformMovieForRow),
    difficultyLabel: getDifficultyLabel(movie.difficulty_level)
  };
}

/**
 * Get subtitles by movie ID
 */
export async function getSubtitlesByMovieId(movieId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('subtitles')
    .select('*')
    .eq('movie_id', movieId);

  if (error) {
    console.error('Error fetching subtitles:', error);
    return [];
  }

  return data || [];
}
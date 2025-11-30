"use client";

import { createClient } from '@/lib/supabase';

/**
 * Client-side movie search function
 * For use in client components like SearchModal
 */
export async function searchMoviesClient(query: string, limit: number = 10) {
  if (!query.trim()) return [];
  
  const supabase = createClient();
  
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
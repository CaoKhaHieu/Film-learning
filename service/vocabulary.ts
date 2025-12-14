"use server";

import { createClient } from '@/lib/supabase-server';

export type SavedWord = {
  id: string;
  user_id: string;
  word: string;
  translation: string | null;
  context_sentence: string | null;
  movie_id: string | null;
  created_at: string;
  movies?: {
    title: string;
    poster: string | null;
  } | null;
};

export async function getSavedWords(userId: string, offset: number, limit: number): Promise<SavedWord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('saved_words')
    .select(`
      *,
      movies (
        title,
        poster
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching saved words:', error);
    return [];
  }

  return data as SavedWord[];
}

export async function deleteSavedWord(wordId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('saved_words')
    .delete()
    .eq('id', wordId);

  if (error) {
    throw error;
  }
}

"use server";

import { getSubtitlesByMovieId } from './movie';
import { fetchAndParseSRT, mergeSubtitles } from '@/lib/srt-parser';

export interface VideoSubtitle {
  id: number;
  startTime: number;
  endTime: number;
  en: string;
  vi: string;
}

/**
 * Fetch and parse subtitles for a movie from SRT files
 * Returns merged English and Vietnamese subtitles
 */
export async function getMovieSubtitles(movieId: string): Promise<VideoSubtitle[]> {
  // Get subtitle URLs from database
  const subtitleRecords = await getSubtitlesByMovieId(movieId);

  if (subtitleRecords.length === 0) {
    console.log(`No subtitles found for movie ${movieId}`);
    return [];
  }

  // Find English and Vietnamese subtitle URLs
  const enSubtitle = subtitleRecords.find(sub => sub.language === 'en');
  const viSubtitle = subtitleRecords.find(sub => sub.language === 'vi');

  if (!enSubtitle && !viSubtitle) {
    console.log(`No valid subtitle URLs found for movie ${movieId}`);
    return [];
  }

  try {
    // Fetch and parse both SRT files in parallel
    const [enParsed, viParsed] = await Promise.all([
      enSubtitle ? fetchAndParseSRT(enSubtitle.url) : Promise.resolve([]),
      viSubtitle ? fetchAndParseSRT(viSubtitle.url) : Promise.resolve([])
    ]);

    // If we only have one language, convert it to the expected format
    if (enParsed.length > 0 && viParsed.length === 0) {
      return enParsed.map(sub => ({
        id: sub.id,
        startTime: sub.startTime,
        endTime: sub.endTime,
        en: sub.text,
        vi: '' // No Vietnamese translation available
      }));
    }

    if (viParsed.length > 0 && enParsed.length === 0) {
      return viParsed.map(sub => ({
        id: sub.id,
        startTime: sub.startTime,
        endTime: sub.endTime,
        en: '', // No English translation available
        vi: sub.text
      }));
    }

    // Merge both languages
    const merged = mergeSubtitles(enParsed, viParsed);

    console.log(`Successfully parsed ${merged.length} subtitle entries for movie ${movieId}`);

    return merged;
  } catch (error) {
    console.error(`Error fetching/parsing subtitles for movie ${movieId}:`, error);
    return [];
  }
}

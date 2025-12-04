/**
 * Utility to parse SRT (SubRip) subtitle files
 */

export interface ParsedSubtitleEntry {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
}

/**
 * Convert SRT timestamp (HH:MM:SS,mmm) to seconds
 * Example: "00:01:23,456" -> 83.456
 */
function parseTimestamp(timestamp: string): number {
  const [time, milliseconds] = timestamp.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);

  return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000;
}

/**
 * Parse SRT file content into structured subtitle entries
 */
export function parseSRT(content: string): ParsedSubtitleEntry[] {
  const subtitles: ParsedSubtitleEntry[] = [];

  // Split by double newline to get individual subtitle blocks
  const blocks = content.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');

    if (lines.length < 3) continue; // Skip invalid blocks

    // Parse subtitle number
    const id = parseInt(lines[0]);
    if (isNaN(id)) continue;

    // Parse timestamps
    const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    if (!timeMatch) continue;

    const startTime = parseTimestamp(timeMatch[1]);
    const endTime = parseTimestamp(timeMatch[2]);

    // Get text (everything after the timestamp line)
    const text = lines.slice(2).join('\n').trim();

    subtitles.push({
      id,
      startTime,
      endTime,
      text
    });
  }

  return subtitles;
}

/**
 * Merge English and Vietnamese subtitles into combined format
 * Matches subtitles by timing (approximate match)
 */
export function mergeSubtitles(
  enSubtitles: ParsedSubtitleEntry[],
  viSubtitles: ParsedSubtitleEntry[]
): Array<{ id: number; startTime: number; endTime: number; en: string; vi: string }> {
  const merged: Array<{ id: number; startTime: number; endTime: number; en: string; vi: string }> = [];

  // Create a map of Vietnamese subtitles by approximate start time
  const viMap = new Map<number, ParsedSubtitleEntry>();
  viSubtitles.forEach(sub => {
    // Round to nearest second for matching
    const roundedTime = Math.round(sub.startTime);
    viMap.set(roundedTime, sub);
  });

  // Merge based on English subtitles as the primary source
  enSubtitles.forEach(enSub => {
    const roundedTime = Math.round(enSub.startTime);

    // Try to find matching Vietnamese subtitle (within 2 seconds)
    let viSub: ParsedSubtitleEntry | undefined;
    for (let offset = 0; offset <= 2; offset++) {
      viSub = viMap.get(roundedTime + offset) || viMap.get(roundedTime - offset);
      if (viSub) break;
    }

    merged.push({
      id: enSub.id,
      startTime: enSub.startTime,
      endTime: enSub.endTime,
      en: enSub.text,
      vi: viSub?.text || '' // Use empty string if no Vietnamese subtitle found
    });
  });

  return merged;
}

/**
 * Fetch and parse SRT file from URL
 */
export async function fetchAndParseSRT(url: string): Promise<ParsedSubtitleEntry[]> {
  try {
    const response = await fetch(url, { cache: 'force-cache' });

    if (!response.ok) {
      console.error(`Failed to fetch SRT from ${url}: ${response.statusText}`);
      return [];
    }

    const content = await response.text();
    return parseSRT(content);
  } catch (error) {
    console.error(`Error fetching SRT from ${url}:`, error);
    return [];
  }
}

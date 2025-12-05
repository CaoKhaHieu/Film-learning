export interface SubtitleCue {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
}

export interface BilingualSubtitle {
  id: number;
  startTime: number;
  endTime: number;
  en: string;
  vi: string;
}

/**
 * Parse VTT time format to seconds
 * Supports: HH:MM:SS.mmm or MM:SS.mmm
 */
export const parseVTTTime = (timeStr: string): number => {
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(seconds);
  } else if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return parseInt(minutes) * 60 + parseFloat(seconds);
  }
  return 0;
};

/**
 * Parse VTT file content into subtitle cues
 */
export const parseVTT = async (url: string): Promise<SubtitleCue[]> => {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.split('\n');
    const cues: SubtitleCue[] = [];

    let i = 0;
    let cueId = 0;

    while (i < lines.length) {
      const line = lines[i].trim();

      // Skip WEBVTT header and empty lines
      if (line === '' || line.startsWith('WEBVTT') || line.startsWith('NOTE')) {
        i++;
        continue;
      }

      // Check if this is a timestamp line
      if (line.includes('-->')) {
        const [startStr, endStr] = line.split('-->').map(s => s.trim());
        const startTime = parseVTTTime(startStr);
        const endTime = parseVTTTime(endStr);

        // Get subtitle text (may be multiple lines)
        i++;
        let text = '';
        while (i < lines.length && lines[i].trim() !== '') {
          text += (text ? ' ' : '') + lines[i].trim().replace(/<[^>]*>/g, ''); // Remove HTML tags
          i++;
        }

        if (text) {
          cues.push({
            id: cueId++,
            startTime,
            endTime,
            text
          });
        }
      }
      i++;
    }

    return cues;
  } catch (error) {
    console.error('Error parsing VTT:', error);
    return [];
  }
};

/**
 * Merge English and Vietnamese subtitles into bilingual format
 */
export const mergeSubtitles = (
  enCues: SubtitleCue[],
  viCues: SubtitleCue[]
): BilingualSubtitle[] => {
  const merged: BilingualSubtitle[] = [];
  const maxLength = Math.max(enCues.length, viCues.length);

  for (let i = 0; i < maxLength; i++) {
    const enCue = enCues[i];
    const viCue = viCues[i];

    if (enCue || viCue) {
      merged.push({
        id: i,
        startTime: enCue?.startTime || viCue?.startTime || 0,
        endTime: enCue?.endTime || viCue?.endTime || 0,
        en: enCue?.text || '',
        vi: viCue?.text || ''
      });
    }
  }

  return merged;
};

/**
 * Load and merge bilingual subtitles from URLs
 */
export const loadBilingualSubtitles = async (
  subtitleEn?: string,
  subtitleVi?: string
): Promise<BilingualSubtitle[]> => {
  if (!subtitleEn && !subtitleVi) return [];

  const [enCues, viCues] = await Promise.all([
    subtitleEn ? parseVTT(subtitleEn) : Promise.resolve([]),
    subtitleVi ? parseVTT(subtitleVi) : Promise.resolve([])
  ]);

  return mergeSubtitles(enCues, viCues);
};

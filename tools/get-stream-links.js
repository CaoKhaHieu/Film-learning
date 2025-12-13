const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with Service Role Key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SrtParser = require('srt-parser-2').default;
const { translate } = require('google-translate-api-x');

const OUTPUT_DIR = path.join(__dirname, '../output');
const ERROR_LOG = path.join(OUTPUT_DIR, 'error.log');
const PROCESSED_LOG = path.join(OUTPUT_DIR, 'processed_ids.txt');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Ensure processed log exists
if (!fs.existsSync(PROCESSED_LOG)) {
  fs.writeFileSync(PROCESSED_LOG, '');
}

function logError(movieId, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] Movie ID ${movieId}: ${message}\n`;
  fs.appendFileSync(ERROR_LOG, logMessage);
  console.error(`ERROR: ${message}`);
}

function markAsProcessed(movieId) {
  fs.appendFileSync(PROCESSED_LOG, `${movieId}\n`);
}

function getProcessedIds() {
  if (!fs.existsSync(PROCESSED_LOG)) return new Set();
  const content = fs.readFileSync(PROCESSED_LOG, 'utf-8');
  return new Set(content.split('\n').map(line => line.trim()).filter(Boolean));
}

async function uploadToStorage(filename, content, contentType) {
  const { data, error } = await supabase
    .storage
    .from('subtitles')
    .upload(filename, content, {
      contentType: contentType,
      upsert: true
    });

  if (error) {
    throw new Error(`Upload failed for ${filename}: ${error.message}`);
  }

  const { data: publicUrlData } = supabase
    .storage
    .from('subtitles')
    .getPublicUrl(filename);

  return publicUrlData.publicUrl;
}

async function translateSubtitleToVietnamese(srtContent) {
  const parser = new SrtParser();
  const srtArray = parser.fromSrt(srtContent);

  console.log(`Translating ${srtArray.length} subtitle lines to Vietnamese...`);

  // Process in batches to avoid rate limits and URL length issues
  const BATCH_SIZE = 20;
  const translatedArray = [];

  for (let i = 0; i < srtArray.length; i += BATCH_SIZE) {
    const batch = srtArray.slice(i, i + BATCH_SIZE);
    const textsToTranslate = batch.map(item => item.text).join(' ||| ');

    try {
      const res = await translate(textsToTranslate, { to: 'vi' });
      const translatedTexts = res.text.split(' ||| ');

      batch.forEach((item, index) => {
        translatedArray.push({
          ...item,
          text: translatedTexts[index] ? translatedTexts[index].trim() : item.text
        });
      });

      // Small delay to be nice to the API
      await new Promise(r => setTimeout(r, 500));

    } catch (e) {
      console.error(`Error translating batch ${i}:`, e.message);
      batch.forEach(item => translatedArray.push(item));
    }
  }

  return parser.toSrt(translatedArray);
}

async function processMovie(movieId, browser) {
  console.log(`\n=== Processing movie ID: ${movieId} ===`);
  const url = `https://flixer.sh/watch/movie/${movieId}`;

  let page = null;

  try {
    page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    let m3u8Link = null;
    let subtitleApiLink = null;

    await page.setRequestInterception(true);

    page.on('request', (request) => {
      const reqUrl = request.url();
      if (!m3u8Link && reqUrl.includes('.m3u8')) {
        m3u8Link = reqUrl;
        console.log('Found m3u8:', reqUrl);
      }
      const lowerUrl = reqUrl.toLowerCase();
      if (
        !subtitleApiLink &&
        (lowerUrl.includes('sub.wyzie.ru') ||
          lowerUrl.includes('/subtitle') ||
          (lowerUrl.includes('sub') && lowerUrl.includes('format=')))
      ) {
        subtitleApiLink = reqUrl;
        console.log('Found subtitle API:', reqUrl);
      }
      request.continue();
    });

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Try to play/enable captions
    try {
      const playButtonSelector = '.play-button, button[aria-label="Play"], .vjs-big-play-button, .jw-display-icon-container';
      if (await page.$(playButtonSelector)) {
        await page.click(playButtonSelector);
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (e) { }

    try {
      const ccButtonSelector = 'button[aria-label="Captions"], .vjs-subs-caps-button, .jw-icon-cc';
      if (await page.$(ccButtonSelector)) {
        await page.click(ccButtonSelector);
      }
    } catch (e) { }

    // Wait for links
    for (let i = 0; i < 15; i++) {
      if (m3u8Link && subtitleApiLink) break;
      await new Promise(r => setTimeout(r, 1000));
    }

    if (!m3u8Link) {
      logError(movieId, 'Missing m3u8 link');
      return;
    }

    if (!subtitleApiLink) {
      logError(movieId, 'Missing subtitle API link');
      return;
    }

    // Fetch subtitle data
    console.log('Fetching subtitle data...');
    const subResponse = await axios.get(subtitleApiLink);
    const subtitles = subResponse.data;

    if (!Array.isArray(subtitles) || subtitles.length === 0) {
      logError(movieId, 'No subtitles found in API response');
      return;
    }

    const englishSubtitle = subtitles.find(sub => sub.language === 'en');
    if (!englishSubtitle) {
      logError(movieId, 'No English subtitle found');
      return;
    }

    // Get Movie UUID
    const { data: movieData, error: movieError } = await supabase
      .from('movies')
      .select('id')
      .eq('tmdb_id', movieId)
      .single();

    if (movieError || !movieData) {
      logError(movieId, `Movie not found in DB: ${movieError?.message}`);
      return;
    }
    const movieUuid = movieData.id;

    // Download English Subtitle
    console.log('Downloading English subtitle...');
    const enSubResponse = await axios.get(englishSubtitle.url);
    const enSubContent = enSubResponse.data;

    // Translate to Vietnamese
    console.log('Translating to Vietnamese...');
    const viSubContent = await translateSubtitleToVietnamese(enSubContent);

    // Upload both
    console.log('Uploading subtitles...');
    const enUrl = await uploadToStorage(`${movieUuid}/en.srt`, enSubContent, 'text/plain');
    const viUrl = await uploadToStorage(`${movieUuid}/vi.srt`, viSubContent, 'text/plain');

    if (!enUrl || !viUrl) {
      logError(movieId, 'Failed to upload one or both subtitles');
      return;
    }

    // All success - Update Database
    console.log('All components found. Updating database...');

    // Update Video URL
    const { error: videoError } = await supabase
      .from('movies')
      .update({ video_url: m3u8Link })
      .eq('id', movieUuid);

    if (videoError) {
      logError(movieId, `DB Error updating video: ${videoError.message}`);
      return;
    }

    // Update Subtitles
    // Delete old subtitles first to be clean
    await supabase.from('subtitles').delete().eq('movie_id', movieUuid);

    const { error: subError } = await supabase
      .from('subtitles')
      .insert([
        { movie_id: movieUuid, language: 'en', url: enUrl },
        { movie_id: movieUuid, language: 'vi', url: viUrl }
      ]);

    if (subError) {
      logError(movieId, `DB Error updating subtitles: ${subError.message}`);
    } else {
      console.log(`SUCCESS: Movie ${movieId} fully updated.`);
    }

  } catch (error) {
    logError(movieId, `Unexpected error: ${error.message}`);
  } finally {
    if (page) await page.close();
    // Mark as processed regardless of outcome to avoid infinite loops on broken movies
    // If user wants to retry, they can delete the processed_ids.txt or specific lines
    markAsProcessed(movieId);
  }
}

async function main() {
  const idsFile = path.join(__dirname, 'movie-ids-data.txt');
  const content = fs.readFileSync(idsFile, 'utf-8');
  const allMovieIds = content.split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));

  const processedIds = getProcessedIds();
  const movieIds = allMovieIds.filter(id => !processedIds.has(id));

  console.log(`Found ${allMovieIds.length} total movies.`);
  console.log(`Skipping ${processedIds.size} already processed movies.`);
  console.log(`Starting processing for ${movieIds.length} remaining movies...`);

  if (movieIds.length === 0) {
    console.log('All movies have been processed!');
    return;
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1920,1080'
    ]
  });

  try {
    for (const id of movieIds) {
      await processMovie(id, browser);
      // Small delay between movies
      await new Promise(r => setTimeout(r, 2000));
    }
  } finally {
    await browser.close();
  }
}

main();

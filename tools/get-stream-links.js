const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getStreamLinks(movieId) {
  const url = `https://flixer.sh/watch/movie/${movieId}`;
  console.log(`Processing movie ID: ${movieId}`);
  console.log(`Navigating to ${url}...`);

  const browser = await puppeteer.launch({
    headless: "new", // Run in headless mode
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();

  // Set a real user agent
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 });

  // Store found links
  let m3u8Link = null;
  let subtitleApiLink = null;

  // Enable request interception
  await page.setRequestInterception(true);

  page.on('request', (request) => {
    const reqUrl = request.url();

    // Check for m3u8 - capture the first one
    if (!m3u8Link && reqUrl.includes('.m3u8')) {
      m3u8Link = reqUrl;
      console.log('Found m3u8:', reqUrl);
    }

    // Check for subtitle API - look for the specific pattern
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

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait a bit more for any delayed requests or player initialization
    console.log('Page loaded, waiting for player...');

    // Try to find and click a play button if it exists
    try {
      const playButtonSelector = '.play-button, button[aria-label="Play"], .vjs-big-play-button, .jw-display-icon-container';
      if (await page.$(playButtonSelector)) {
        console.log('Clicking play button...');
        await page.click(playButtonSelector);
        await new Promise(r => setTimeout(r, 2000)); // Wait after click
      }
    } catch (e) {
      console.log('Play click error:', e.message);
    }

    // Try to find CC button and click it to force subtitle load
    try {
      const ccButtonSelector = 'button[aria-label="Captions"], .vjs-subs-caps-button, .jw-icon-cc';
      if (await page.$(ccButtonSelector)) {
        console.log('Clicking CC button...');
        await page.click(ccButtonSelector);
      }
    } catch (e) {
      console.log('CC click error:', e.message);
    }

    // Wait for up to 15 seconds, but check periodically if we found the links
    for (let i = 0; i < 15; i++) {
      if (m3u8Link && subtitleApiLink) break;
      await new Promise(r => setTimeout(r, 1000));
    }

    // First, get the movie UUID from database
    const { data: movieData, error: movieError } = await supabase
      .from('movies')
      .select('id')
      .eq('tmdb_id', movieId)
      .single();

    if (movieError || !movieData) {
      console.error('Error finding movie in database:', movieError);
      await browser.close();
      return;
    }

    const movieUuid = movieData.id;
    console.log(`Found movie UUID: ${movieUuid}`);

    // Update video URL if found
    if (m3u8Link) {
      console.log('Updating video URL in database...');
      const { error } = await supabase
        .from('movies')
        .update({ video_url: m3u8Link })
        .eq('tmdb_id', movieId);

      if (error) {
        console.error('Error updating video URL:', error);
      } else {
        console.log(`Successfully updated movie ${movieId} with video URL.`);
      }
    } else {
      console.log('No m3u8 link found.');
    }

    // Fetch and save subtitle if API link found
    if (subtitleApiLink) {
      console.log('Fetching subtitle data from API...');
      try {
        // Fetch subtitle list from API
        const response = await axios.get(subtitleApiLink);
        const subtitles = response.data;

        if (Array.isArray(subtitles) && subtitles.length > 0) {
          // Find first English subtitle
          const englishSubtitle = subtitles.find(sub => sub.language === 'en');

          if (englishSubtitle) {
            console.log('Found English subtitle:', englishSubtitle.display);
            console.log('Subtitle URL:', englishSubtitle.url);

            // Download the subtitle content
            const subtitleResponse = await axios.get(englishSubtitle.url);
            const subtitleContent = subtitleResponse.data;

            // For now, we'll save the URL. In production, you might want to upload the content to storage
            const { error: subtitleError } = await supabase
              .from('subtitles')
              .insert({
                movie_id: movieUuid,
                language: 'en',
                url: englishSubtitle.url
              });

            if (subtitleError) {
              console.error('Error saving subtitle:', subtitleError);
            } else {
              console.log(`Successfully saved English subtitle for movie ${movieId}`);
            }
          } else {
            console.log('No English subtitle found in the API response.');
          }
        } else {
          console.log('No subtitles returned from API.');
        }
      } catch (error) {
        console.error('Error fetching subtitle data:', error.message);
      }
    } else {
      console.log('No subtitle API link found.');
    }

  } catch (error) {
    console.error('Error during navigation:', error);
  } finally {
    await browser.close();
  }
}

// Get movie ID from command line or use default
const movieId = process.argv[2] || '1035259';
getStreamLinks(movieId);

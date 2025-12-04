/**
 * Script to crawl movie data from TMDB API via Flixer proxy
 * Usage: node tools/crawl-movies.js <movie_id1> <movie_id2> ...
 * Example: node tools/crawl-movies.js 1038392 550 13
 */

const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'https://plsdontscrapemelove.flixer.sh/api/tmdb/movie';
const LANGUAGE = 'vi';
const OUTPUT_DIR = path.join(__dirname, 'output');
const DELAY_MS = 1000; // Delay between requests to be respectful

/**
 * Fetch movie data from API
 */
async function fetchMovieData(movieId) {
  const url = `${API_BASE_URL}/${movieId}?language=${LANGUAGE}`;
  
  try {
    console.log(`Fetching movie ID: ${movieId}...`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching movie ${movieId}:`, error.message);
    return null;
  }
}

/**
 * Transform API data to our database format
 */
function transformMovieData(apiData) {
  // Extract genre names
  const genres = apiData.genres?.map(g => g.name).join(', ') || '';
  
  // Construct full image URLs
  const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/original';
  const backdropPath = apiData.backdrop_path 
    ? `${TMDB_IMAGE_BASE}${apiData.backdrop_path}` 
    : '';
  const posterPath = apiData.poster_path 
    ? `${TMDB_IMAGE_BASE}${apiData.poster_path}` 
    : '';
  
  return {
    tmdb_id: apiData.id || 0,
    title: apiData.original_title || '',
    title_vi: apiData.title || '',
    release_date: apiData.release_date || '',
    runtime: apiData.runtime || 0,
    vote_average: apiData.vote_average || 0,
    genres: genres,
    background_image: backdropPath,
    poster: posterPath,
    difficulty_level: 'beginner',
    is_vip: false,
    overview: apiData.overview || '',
  };
}

/**
 * Generate CSV row
 */
function generateCSVRow(movieData) {
  const {
    tmdb_id,
    title,
    title_vi,
    release_date,
    runtime,
    vote_average,
    genres,
    background_image,
    poster,
    difficulty_level,
    is_vip,
    overview,
  } = movieData;
  
  // Escape quotes for CSV
  const escape = (str) => `"${str.replace(/"/g, '""')}"`;
  
  return [
    tmdb_id,
    escape(title),
    escape(title_vi),
    release_date,
    runtime,
    vote_average,
    escape(genres),
    escape(background_image),
    escape(poster),
    difficulty_level,
    is_vip,
    escape(overview),
  ].join(',');
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function
 */
async function main() {
  const movieIds = process.argv.slice(2);
  
  if (movieIds.length === 0) {
    console.log('Usage: node tools/crawl-movies.js <movie_id1> <movie_id2> ...');
    console.log('Example: node tools/crawl-movies.js 1038392 550 13');
    process.exit(1);
  }
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const csvOutputPath = path.join(OUTPUT_DIR, `movies-${timestamp}.csv`);
  
  const results = [];
  const csvRows = [];
  
  // CSV Header
  csvRows.push([
    'tmdb_id',
    'title',
    'title_vi',
    'release_date',
    'runtime',
    'vote_average',
    'genres',
    'background_image',
    'poster',
    'difficulty_level',
    'is_vip',
    'overview',
  ].join(','));
  
  console.log(`\nCrawling ${movieIds.length} movie(s)...\n`);
  
  for (let i = 0; i < movieIds.length; i++) {
    const movieId = movieIds[i];
    
    // Fetch data
    const apiData = await fetchMovieData(movieId);
    
    if (apiData) {
      // Transform data
      const movieData = transformMovieData(apiData);
      results.push(movieData);
      
      // Generate CSV row
      const csvRow = generateCSVRow(movieData);
      csvRows.push(csvRow);
      
      console.log(`✓ ${movieData.title} (${movieData.title_vi})`);
    }
    
    // Delay between requests (except for the last one)
    if (i < movieIds.length - 1) {
      await sleep(DELAY_MS);
    }
  }
  
  // Save CSV
  console.log(`\n📝 Saving results...`);
  fs.writeFileSync(csvOutputPath, csvRows.join('\n'));
  console.log(`✓ CSV: ${csvOutputPath}`);
  
  console.log(`\n✅ Done! Crawled ${results.length} movie(s).`);
  console.log(`\nYou can now import the CSV file into Supabase:`);
  console.log(`1. Go to Supabase → Table Editor → movies table`);
  console.log(`2. Click "Insert" → "Import data from CSV"`);
  console.log(`3. Upload: ${csvOutputPath}`);
}

// Run the script
main().catch(console.error);

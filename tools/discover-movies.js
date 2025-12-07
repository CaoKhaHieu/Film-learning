/**
 * Discover movies from TMDB and save IDs to movie-ids.txt
 * Usage: node tools/discover-movies.js [pages]
 * Example: node tools/discover-movies.js 5
 */

const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'https://plsdontscrapemelove.flixer.sh/api/tmdb/discover/movie';
const LANGUAGE = 'vi-VN';
const OUTPUT_FILE = path.join(__dirname, 'movie-ids.txt');
const DELAY_MS = 1000; // Delay between requests

/**
 * Fetch movies from discover API
 */
async function discoverMovies(page = 1) {
  const url = `${API_BASE_URL}?language=${LANGUAGE}&page=${page}`;

  try {
    console.log(`Fetching page ${page}...`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching page ${page}:`, error.message);
    return null;
  }
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
  const numPages = parseInt(process.argv[2]) || 1;

  if (numPages < 1 || numPages > 1000) {
    console.log('Usage: node tools/discover-movies.js [pages]');
    console.log('Example: node tools/discover-movies.js 5');
    console.log('\nPages must be between 1 and 100');
    process.exit(1);
  }

  console.log(`\n🎬 Discovering movies from TMDB...`);
  console.log(`📄 Fetching ${numPages} page(s)\n`);

  const allMovieIds = [];
  const movieDetails = [];

  for (let page = 1; page <= numPages; page++) {
    const data = await discoverMovies(page);

    if (data && data.results) {
      const movies = data.results;

      movies.forEach(movie => {
        allMovieIds.push(movie.id);
        movieDetails.push({
          id: movie.id,
          title: movie.title,
          original_title: movie.original_title,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
        });
      });

      console.log(`✓ Page ${page}: Found ${movies.length} movies (Total: ${allMovieIds.length})`);

      // Show some examples from this page
      if (movies.length > 0) {
        const examples = movies.slice(0, 3);
        examples.forEach(m => {
          console.log(`  - ${m.id}: ${m.title} (${m.original_title})`);
        });
        if (movies.length > 3) {
          console.log(`  ... and ${movies.length - 3} more`);
        }
      }
    }

    // Delay between requests (except for the last one)
    if (page < numPages) {
      await sleep(DELAY_MS);
    }
  }

  if (allMovieIds.length === 0) {
    console.log('\n❌ No movies found.');
    process.exit(1);
  }

  // Save to file
  console.log(`\n📝 Saving ${allMovieIds.length} movie IDs to ${OUTPUT_FILE}...`);

  const content = [
    '# Movie IDs from TMDB Discover API',
    `# Generated: ${new Date().toISOString()}`,
    `# Total movies: ${allMovieIds.length}`,
    `# Pages fetched: ${numPages}`,
    '',
    '# Format: One movie ID per line',
    '# You can add comments with #',
    '',
    ...allMovieIds.map(id => id.toString()),
  ].join('\n');

  fs.writeFileSync(OUTPUT_FILE, content);

  console.log(`✓ Saved to: ${OUTPUT_FILE}`);

  // Show statistics
  console.log(`\n📊 Statistics:`);
  console.log(`   Total movies: ${allMovieIds.length}`);
  console.log(`   Pages fetched: ${numPages}`);
  console.log(`   Average per page: ${Math.round(allMovieIds.length / numPages)}`);

  // Show top rated movies
  const topRated = movieDetails
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 5);

  console.log(`\n⭐ Top 5 Rated Movies:`);
  topRated.forEach((movie, index) => {
    console.log(`   ${index + 1}. ${movie.title} (${movie.vote_average}/10) - ID: ${movie.id}`);
  });

  console.log(`\n✅ Done! You can now run:`);
  console.log(`   node tools/crawl-movies-batch.js tools/movie-ids.txt`);
}

main().catch(console.error);

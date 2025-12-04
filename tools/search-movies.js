/**
 * Search for movies on TMDB and get their IDs
 * Usage: node tools/search-movies.js <query>
 * Example: node tools/search-movies.js "inception"
 */

const API_BASE_URL = 'https://plsdontscrapemelove.flixer.sh/api/tmdb/search/movie';
const LANGUAGE = 'vi';

async function searchMovies(query) {
  const url = `${API_BASE_URL}?query=${encodeURIComponent(query)}&language=${LANGUAGE}`;
  
  try {
    console.log(`\n🔍 Searching for: "${query}"...\n`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching movies:', error.message);
    return [];
  }
}

function displayResults(results) {
  if (results.length === 0) {
    console.log('❌ No results found.');
    return;
  }
  
  console.log(`✅ Found ${results.length} result(s):\n`);
  console.log('─'.repeat(80));
  
  results.slice(0, 10).forEach((movie, index) => {
    console.log(`\n${index + 1}. ${movie.title || movie.original_title}`);
    console.log(`   ID: ${movie.id}`);
    console.log(`   Original: ${movie.original_title}`);
    console.log(`   Release: ${movie.release_date || 'N/A'}`);
    console.log(`   Rating: ⭐ ${movie.vote_average || 'N/A'}/10`);
    if (movie.overview) {
      const shortOverview = movie.overview.length > 100 
        ? movie.overview.substring(0, 100) + '...' 
        : movie.overview;
      console.log(`   Overview: ${shortOverview}`);
    }
  });
  
  console.log('\n' + '─'.repeat(80));
  
  if (results.length > 10) {
    console.log(`\n(Showing first 10 of ${results.length} results)`);
  }
  
  // Show quick copy IDs
  const ids = results.slice(0, 10).map(m => m.id).join(' ');
  console.log(`\n📋 Quick copy (first 10 IDs):`);
  console.log(`   ${ids}`);
  console.log(`\n💡 To crawl these movies:`);
  console.log(`   node tools/crawl-movies.js ${ids}`);
}

async function main() {
  const query = process.argv.slice(2).join(' ');
  
  if (!query) {
    console.log('Usage: node tools/search-movies.js <query>');
    console.log('Example: node tools/search-movies.js "inception"');
    console.log('Example: node tools/search-movies.js "the dark knight"');
    process.exit(1);
  }
  
  const results = await searchMovies(query);
  displayResults(results);
}

main().catch(console.error);

/**
 * Batch crawler - reads movie IDs from a text file
 * Usage: node tools/crawl-movies-batch.js <file_path>
 * Example: node tools/crawl-movies-batch.js tools/movie-ids.txt
 * 
 * File format: One movie ID per line
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function main() {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.log('Usage: node tools/crawl-movies-batch.js <file_path>');
    console.log('Example: node tools/crawl-movies-batch.js tools/movie-ids.txt');
    console.log('\nFile format: One movie ID per line');
    process.exit(1);
  }
  
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }
  
  // Read and parse movie IDs
  const content = fs.readFileSync(filePath, 'utf-8');
  const movieIds = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#')) // Skip empty lines and comments
    .filter(id => /^\d+$/.test(id)); // Only keep valid numeric IDs
  
  if (movieIds.length === 0) {
    console.error('Error: No valid movie IDs found in file');
    process.exit(1);
  }
  
  console.log(`Found ${movieIds.length} movie ID(s) in ${filePath}`);
  console.log('Starting batch crawl...\n');
  
  // Call the main crawler script
  const command = `node tools/crawl-movies.js ${movieIds.join(' ')}`;
  
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error running crawler:', error.message);
    process.exit(1);
  }
}

main();

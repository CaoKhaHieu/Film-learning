const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL in .env.local');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('Error: Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.error('-------------------------------------------------------');
  console.error('To run this admin script, you need the Service Role Key to bypass RLS policies.');
  console.error('1. Go to Supabase Dashboard > Project Settings > API');
  console.error('2. Copy the "service_role" secret key');
  console.error('3. Add it to your .env.local file:');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  console.error('-------------------------------------------------------');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to find the latest CSV file in tools/output
function findLatestCsv() {
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    return null;
  }

  const files = fs.readdirSync(outputDir)
    .filter(file => file.startsWith('movies-') && file.endsWith('.csv'))
    .map(file => ({
      name: file,
      time: fs.statSync(path.join(outputDir, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  return files.length > 0 ? path.join(outputDir, files[0].name) : null;
}

// Get CSV file path from argument or find latest
let csvFilePath = process.argv[2];

if (!csvFilePath) {
  console.log('No CSV file specified. Looking for latest file in tools/output...');
  csvFilePath = findLatestCsv();
}

if (!csvFilePath || !fs.existsSync(csvFilePath)) {
  console.error(`Error: CSV file not found: ${csvFilePath}`);
  console.log('Usage: node tools/import-movies.js [path/to/file.csv]');
  process.exit(1);
}

console.log(`Using CSV file: ${csvFilePath}`);

const movies = [];

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (data) => movies.push(data))
  .on('end', async () => {
    console.log(`Found ${movies.length} movies to import.`);

    let successCount = 0;
    let errorCount = 0;

    for (const movie of movies) {
      try {
        console.log(`Processing: ${movie.title} (TMDB ID: ${movie.tmdb_id})`);

        // Prepare movie object matching Supabase schema
        const movieData = {
          tmdb_id: parseInt(movie.tmdb_id),
          title: movie.title,
          title_vi: movie.title_vi,
          overview: movie.overview,
          poster: movie.poster,
          background_image: movie.background_image,
          release_date: movie.release_date || null,
          runtime: parseInt(movie.runtime) || null,
          vote_average: parseFloat(movie.vote_average) || null,
          genres: movie.genres,
          is_vip: movie.is_vip === 'true',
          difficulty_level: movie.difficulty_level || 'beginner',
          // Default video_url if not present (can be updated later)
          video_url: movie.video_url || null
        };

        // Upsert movie (update if tmdb_id exists)
        const { data: insertedData, error } = await supabase
          .from('movies')
          .upsert(movieData, { onConflict: 'tmdb_id' })
          .select()
          .single();

        if (error) {
          console.error(`  ❌ Error importing ${movie.title}:`, error.message);
          errorCount++;
        } else {
          console.log(`  ✅ Imported/Updated successfully (ID: ${insertedData.id})`);
          successCount++;
        }

      } catch (err) {
        console.error(`  ❌ Unexpected error processing ${movie.title}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n-------------------------------------------------------');
    console.log(`Import completed!`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log('-------------------------------------------------------');
  });

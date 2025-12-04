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

const csvFilePath = path.join(__dirname, '../data/data.csv');
const movies = [];

console.log('Reading CSV file...');

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (data) => movies.push(data))
  .on('end', async () => {
    console.log(`Found ${movies.length} movies to import.`);
    
    for (const movie of movies) {
      try {
        console.log(`Importing: ${movie.title}`);

        // 1. Insert Movie
        const { data: movieData, error: movieError } = await supabase
          .from('movies')
          .insert({
            title: movie.title,
            description: movie.description,
            poster: movie.poster,
            video_url: movie.video_url,
            is_vip: movie.is_vip === 'true',
            difficulty_level: movie.difficulty_level
          })
          .select()
          .single();

        if (movieError) {
          console.error(`Error inserting movie ${movie.title}:`, movieError.message);
          continue;
        }

        const movieId = movieData.id;
        console.log(`  -> Movie inserted with ID: ${movieId}`);

        // 2. Insert Subtitles (if URLs exist)
        const subtitlesToInsert = [];
        
        if (movie.subtitle_en_url) {
          subtitlesToInsert.push({
            movie_id: movieId,
            language: 'en',
            url: movie.subtitle_en_url
          });
        }

        if (movie.subtitle_vi_url) {
          subtitlesToInsert.push({
            movie_id: movieId,
            language: 'vi',
            url: movie.subtitle_vi_url
          });
        }

        if (subtitlesToInsert.length > 0) {
          const { error: subError } = await supabase
            .from('subtitles')
            .insert(subtitlesToInsert);

          if (subError) {
            console.error(`  -> Error inserting subtitles for ${movie.title}:`, subError.message);
          } else {
            console.log(`  -> Inserted ${subtitlesToInsert.length} subtitles.`);
          }
        }

      } catch (err) {
        console.error(`Unexpected error processing ${movie.title}:`, err);
      }
    }

    console.log('Import process completed!');
  });

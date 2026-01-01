import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const { tmdbId } = await request.json();

    if (!tmdbId) {
      return NextResponse.json({ error: "Missing TMDB ID" }, { status: 400 });
    }

    // 1. Fetch Movie Info from the provided API
    const movieApiUrl = `https://plsdontscrapemelove.flixer.sh/api/tmdb/movie/${tmdbId}?language=vi-VN`;
    const movieRes = await fetch(movieApiUrl);

    if (!movieRes.ok) {
      return NextResponse.json({ error: "Failed to fetch movie info from API" }, { status: 500 });
    }

    const movieJson = await movieRes.json();

    // Transform to our DB schema
    const movieData = {
      tmdb_id: movieJson.id,
      title: movieJson.title || movieJson.original_title,
      title_vi: movieJson.title_vi || movieJson.title,
      overview: movieJson.overview,
      poster: movieJson.poster_path ? `https://image.tmdb.org/t/p/original${movieJson.poster_path}` : null,
      background_image: movieJson.backdrop_path ? `https://image.tmdb.org/t/p/original${movieJson.backdrop_path}` : null,
      release_date: movieJson.release_date || null,
      runtime: movieJson.runtime || null,
      vote_average: movieJson.vote_average || null,
      genres: movieJson.genres?.map((g: any) => g.name).join(", ") || "",
      difficulty_level: "intermediate", // Default
      is_vip: false,
      video_url: "",
    };

    // 2. Return the transformed data for preview
    return NextResponse.json({
      success: true,
      movie: movieData,
      message: "Movie info fetched successfully."
    });

  } catch (error: any) {
    console.error("Error in crawl API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

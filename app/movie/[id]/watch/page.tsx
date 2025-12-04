import { VideoPlayer } from "@/components/VideoPlayer";
import { getMovieById } from "@/service/movie";
import { getMovieSubtitles } from "@/service/subtitle";
import { notFound } from "next/navigation";
import { VideoPlayerWrapper } from "./VideoPlayerWrapper";

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch movie data and subtitles from backend in parallel
  const [movie, subtitles] = await Promise.all([
    getMovieById(id),
    getMovieSubtitles(id)
  ]);

  // If movie not found, show 404
  if (!movie) {
    notFound();
  }

  // Use default HLS stream if video_url is not available
  const videoUrl = movie.video_url || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

  return (
    <VideoPlayerWrapper
      src={videoUrl}
      title={movie.title}
      poster={movie.poster}
      subtitles={subtitles}
    />
  );
}

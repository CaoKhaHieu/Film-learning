import { VideoPlayer } from "@/components/VideoPlayer";
import { getMovieById, getSubtitlesByMovieId } from "@/service/movie";
import { notFound } from "next/navigation";

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch movie data and subtitles from backend
  const [movie, subtitles] = await Promise.all([
    getMovieById(id),
    getSubtitlesByMovieId(id)
  ]);

  // If movie not found, show 404
  if (!movie) {
    notFound();
  }

  // Use default HLS stream if video_url is not available
  const videoUrl = movie.video_url || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

  // Find English and Vietnamese subtitle URLs
  const enSubtitle = subtitles.find(sub => sub.language === 'en');
  const viSubtitle = subtitles.find(sub => sub.language === 'vi');

  return (
    <VideoPlayer
      src={videoUrl}
      title={movie.title_vi || movie.title}
      subTitle={movie.title_vi ? movie.title : undefined}
      poster={movie.poster || undefined}
      subtitleEn={enSubtitle?.url}
      subtitleVi={viSubtitle?.url}
      movieId={id}
      autoPlay
    />
  );
}

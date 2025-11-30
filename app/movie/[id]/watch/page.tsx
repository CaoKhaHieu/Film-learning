import { VideoPlayer } from "@/components/VideoPlayer";

export default function WatchPage() {
  // Use a public test HLS stream
  const videoSrc = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
  const poster = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop";

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <VideoPlayer src={videoSrc} poster={poster} autoPlay={true} />
    </div>
  );
}

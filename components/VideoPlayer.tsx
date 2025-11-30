"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, SkipForward, ArrowLeft, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Subtitle {
  id: number;
  startTime: number;
  endTime: number;
  en: string;
  vi: string;
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  subtitles?: Subtitle[];
  title?: string;
  subTitle?: string;
}

export function VideoPlayer({ src, poster, autoPlay = false, subtitles = [], title, subTitle }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const subtitleListRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [currentSubtitle, setCurrentSubtitle] = useState<{ en: string; vi: string; id: number } | null>(null);
  const [showSubtitleSidebar, setShowSubtitleSidebar] = useState(true); // Default true
  const [wasPlaying, setWasPlaying] = useState(false); // Track play state before hover
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    // Check if source is HLS
    const isHLS = src.includes(".m3u8");

    if (isHLS && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch(() => {
            // Autoplay failed, user interaction required
          });
        }
      });
    } else {
      // For MP4 or native HLS support (Safari)
      video.src = src;
      if (autoPlay) {
        video.play().catch(() => { });
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, autoPlay]);

  // Handle Controls Visibility
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("click", handleMouseMove); // Show controls on click too
      container.addEventListener("mouseleave", () => {
        if (isPlaying) setShowControls(false);
      });
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("click", handleMouseMove);
        container.removeEventListener("mouseleave", () => { });
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Auto-scroll subtitle list to active item
  useEffect(() => {
    if (showSubtitleSidebar && currentSubtitle && subtitleListRef.current) {
      const activeElement = subtitleListRef.current.querySelector(`[data-id="${currentSubtitle.id}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentSubtitle, showSubtitleSidebar]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      setProgress((currentTime / videoRef.current.duration) * 100);
      setDuration(videoRef.current.duration);

      // Update Subtitles
      const sub = subtitles.find(
        (s) => currentTime >= s.startTime && currentTime <= s.endTime
      );
      setCurrentSubtitle(sub ? { en: sub.en, vi: sub.vi, id: sub.id } : null);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const handleSubtitleClick = (startTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
      videoRef.current.pause(); // Pause when clicked to read
      setIsPlaying(false);
    }
  };

  const handleSubtitleHover = (isHovering: boolean) => {
    if (videoRef.current) {
      if (isHovering) {
        if (isPlaying) {
          setWasPlaying(true);
          videoRef.current.pause();
          setIsPlaying(false);
        }
      } else {
        if (wasPlaying) {
          videoRef.current.play();
          setIsPlaying(true);
          setWasPlaying(false);
        }
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black group overflow-hidden flex"
    >
      <div className="relative flex-1 h-full bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          poster={poster}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Subtitles Overlay (On Video) */}
        <div className={`absolute bottom-24 left-0 right-0 text-center px-4 z-30 pointer-events-none transition-all duration-300 ${showControls ? 'bottom-24' : 'bottom-12'}`}>
          {currentSubtitle && (
            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
              <p className="text-xl md:text-2xl font-bold text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] bg-black/40 inline-block mx-auto px-4 py-1 rounded-lg backdrop-blur-sm">
                {currentSubtitle.en}
              </p>
              <p className="text-lg md:text-xl font-medium text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] bg-black/40 inline-block mx-auto px-4 py-1 rounded-lg backdrop-blur-sm">
                {currentSubtitle.vi}
              </p>
            </div>
          )}
        </div>

        {/* Top Bar */}
        <div className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 z-20 ${showControls ? "opacity-100" : "opacity-0"}`}>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => router.back()}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-white font-bold text-lg md:text-xl">{title || "Video Player"}</h1>
              {subTitle && <p className="text-gray-300 text-sm">{subTitle}</p>}
            </div>
          </div>
        </div>

        {/* Play Button Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="bg-black/50 p-4 rounded-full backdrop-blur-sm border border-white/20">
              <Play className="w-12 h-12 text-white fill-white" />
            </div>
          </div>
        )}

        {/* Click Overlay */}
        <div
          className="absolute inset-0 z-0"
          onClick={togglePlay}
        />

        {/* Bottom Controls */}
        <div className={`absolute bottom-0 left-0 right-0 px-4 pb-4 pt-12 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 z-20 ${showControls ? "opacity-100" : "opacity-0"}`}>
          {/* Progress Bar */}
          <div className="relative w-full h-1.5 bg-gray-600 rounded-full mb-4 cursor-pointer group/progress">
            <div
              className="absolute top-0 left-0 h-full bg-yellow-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white hover:text-yellow-500" onClick={togglePlay}>
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </Button>

              <Button variant="ghost" size="icon" className="text-white hover:text-yellow-500">
                <SkipForward className="w-6 h-6 fill-current" />
              </Button>

              <div className="flex items-center gap-2 group/volume">
                <Button variant="ghost" size="icon" className="text-white hover:text-yellow-500" onClick={toggleMute}>
                  {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 h-1 bg-gray-600 rounded-full accent-yellow-500"
                />
              </div>

              <div className="text-sm font-medium text-gray-300">
                {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className={`text-white hover:text-yellow-500 ${showSubtitleSidebar ? 'text-yellow-500 bg-white/10' : ''}`}
                onClick={() => setShowSubtitleSidebar(!showSubtitleSidebar)}
                title="Danh sách phụ đề"
              >
                <List className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:text-yellow-500">
                <Settings className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:text-yellow-500" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Subtitle Sidebar */}
      <div
        className={`bg-zinc-900 border-l border-zinc-800 transition-all duration-300 ease-in-out flex flex-col ${showSubtitleSidebar ? "w-80 translate-x-0" : "w-0 translate-x-full opacity-0"
          }`}
        onMouseEnter={() => handleSubtitleHover(true)}
        onMouseLeave={() => handleSubtitleHover(false)}
      >
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900 z-10">
          <h3 className="text-white font-bold">Danh sách hội thoại</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => setShowSubtitleSidebar(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div ref={subtitleListRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          {subtitles.map((sub) => (
            <div
              key={sub.id}
              data-id={sub.id}
              onClick={() => handleSubtitleClick(sub.startTime)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border group/item ${currentSubtitle?.id === sub.id
                ? "bg-yellow-500/10 border-yellow-500/50"
                : "bg-zinc-800/50 border-transparent hover:bg-zinc-800 hover:border-zinc-700"
                }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-xs font-mono ${currentSubtitle?.id === sub.id ? "text-yellow-500" : "text-gray-500 group-hover/item:text-gray-300"}`}>
                  {formatTime(sub.startTime)}
                </span>
              </div>
              <p className={`text-sm font-medium mb-1 ${currentSubtitle?.id === sub.id ? "text-yellow-400" : "text-gray-200 group-hover/item:text-white"}`}>
                {sub.en}
              </p>
              <p className={`text-xs ${currentSubtitle?.id === sub.id ? "text-white" : "text-gray-400 group-hover/item:text-gray-300"}`}>
                {sub.vi}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

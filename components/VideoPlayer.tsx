"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, SkipBack, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  title?: string;
  subTitle?: string;
}

export function VideoPlayer({ src, poster, autoPlay = false, title, subTitle }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize HLS
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
      container.addEventListener("click", handleMouseMove);
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
    if (videoRef.current && !isNaN(videoRef.current.duration)) {
      const currentTime = videoRef.current.currentTime;
      const videoDuration = videoRef.current.duration;

      // Update duration if it changed
      if (duration !== videoDuration) {
        setDuration(videoDuration);
      }

      // Calculate progress percentage
      const progressPercent = (currentTime / videoDuration) * 100;
      setProgress(progressPercent);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current && !isNaN(duration) && duration > 0) {
      const seekPercent = parseFloat(e.target.value);
      const seekTime = (seekPercent / 100) * duration;

      // Clamp seekTime to valid range
      const clampedSeekTime = Math.max(0, Math.min(seekTime, duration));

      videoRef.current.currentTime = clampedSeekTime;
      // Don't manually set progress - let handleTimeUpdate do it
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && !isNaN(duration) && duration > 0) {
      const progressBar = e.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickPercent = (clickX / rect.width) * 100;

      // Clamp to 0-100%
      const clampedPercent = Math.max(0, Math.min(clickPercent, 100));
      const seekTime = (clampedPercent / 100) * duration;

      videoRef.current.currentTime = seekTime;
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      // Format: HH:MM:SS
      return `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    } else {
      // Format: MM:SS
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black group overflow-hidden"
    >
      <div className="relative w-full h-full bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          poster={poster}
          onLoadedMetadata={(e) => {
            const video = e.currentTarget;
            if (!isNaN(video.duration)) {
              setDuration(video.duration);
            }
          }}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

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
          <div
            className="relative w-full py-2 mb-2 cursor-pointer group/progress"
            onClick={handleProgressClick}
          >
            <div className="relative w-full h-1.5 bg-gray-600 rounded-full">
              <div
                className="absolute top-0 left-0 h-full bg-yellow-500 rounded-full pointer-events-none"
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
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white hover:text-yellow-500" onClick={() => skip(-10)}>
                <SkipBack className="w-6 h-6 fill-current" />
              </Button>

              <Button variant="ghost" size="icon" className="text-white hover:text-yellow-500" onClick={togglePlay}>
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </Button>

              <Button variant="ghost" size="icon" className="text-white hover:text-yellow-500" onClick={() => skip(10)}>
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
              <Button variant="ghost" size="icon" className="text-white hover:text-yellow-500" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

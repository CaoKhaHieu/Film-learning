"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, SkipBack, ArrowLeft, List, Subtitles, Flag, RotateCcw, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { BilingualSubtitle, loadBilingualSubtitles } from "@/lib/subtitle-parser";
import { createClient } from "@/lib/supabase";
import { SubtitleOverlay } from "@/components/SubtitleOverlay";
import { SubtitleSidebar } from "@/components/SubtitleSidebar";
import { ReportIssueModal } from "@/components/ReportIssueModal";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  title?: string;
  subTitle?: string;
  subtitleEn?: string;
  subtitleVi?: string;
  movieId?: string;
}

export function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  title,
  subTitle,
  subtitleEn,
  subtitleVi,
  movieId
}: VideoPlayerProps) {
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
  const [showSubtitleSidebar, setShowSubtitleSidebar] = useState(true);
  const [subtitleMode, setSubtitleMode] = useState<'both' | 'en' | 'off'>('both');
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [subtitles, setSubtitles] = useState<BilingualSubtitle[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<BilingualSubtitle | null>(null);
  const [sidebarActiveSubtitle, setSidebarActiveSubtitle] = useState<BilingualSubtitle | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subtitleMenuRef = useRef<HTMLDivElement | null>(null);

  // Close subtitle menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (subtitleMenuRef.current && !subtitleMenuRef.current.contains(event.target as Node)) {
        setShowSubtitleMenu(false);
      }
    };

    if (showSubtitleMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSubtitleMenu]);

  // Load subtitles
  useEffect(() => {
    const loadSubs = async () => {
      const subs = await loadBilingualSubtitles(subtitleEn, subtitleVi);
      setSubtitles(subs);
    };
    loadSubs();
  }, [subtitleEn, subtitleVi]);

  // Load saved progress
  const supabase = createClient();
  const lastSavedTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!movieId) return;

    const loadProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('watch_progress')
        .select('watched_time')
        .eq('user_id', user.id)
        .eq('movie_id', movieId)
        .single();

      if (data && videoRef.current) {
        // Only seek if we are at the beginning
        if (videoRef.current.currentTime < 1) {
          videoRef.current.currentTime = data.watched_time;
          lastSavedTimeRef.current = data.watched_time;
        }
      }
    };

    loadProgress();
  }, [movieId]);

  // Save progress function
  const saveProgress = async (currentTime: number, duration: number) => {
    if (!movieId) return;

    // Don't save if time hasn't changed significantly (e.g. paused)
    if (Math.abs(currentTime - lastSavedTimeRef.current) < 2 && currentTime !== 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase.from('watch_progress').upsert({
        user_id: user.id,
        movie_id: movieId,
        watched_time: Math.floor(currentTime),
        duration: Math.floor(duration),
        updated_at: new Date().toISOString()
      });
      lastSavedTimeRef.current = currentTime;
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  // Save progress periodically (every 30s) and on Pause
  useEffect(() => {
    if (!movieId) return;

    const interval = setInterval(() => {
      if (videoRef.current && isPlaying) {
        saveProgress(videoRef.current.currentTime, videoRef.current.duration);
      }
    }, 15000); // Save every 15 seconds

    return () => clearInterval(interval);
  }, [movieId, isPlaying]);

  // Save on Pause
  useEffect(() => {
    if (!isPlaying && videoRef.current) {
      saveProgress(videoRef.current.currentTime, videoRef.current.duration);
    }
  }, [isPlaying]);

  // Auto-close sidebar when subtitle mode is OFF
  useEffect(() => {
    if (subtitleMode === 'off') {
      setShowSubtitleSidebar(false);
    }
  }, [subtitleMode]);

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    const isHLS = src.includes(".m3u8");

    if (isHLS && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch(() => { });
        }
      });
    } else {
      video.src = src;
      if (autoPlay) {
        video.play().catch(() => { });
      }
    }

    // Disable native subtitles (we use custom overlay instead)
    if (video.textTracks.length > 0) {
      for (let i = 0; i < video.textTracks.length; i++) {
        video.textTracks[i].mode = 'hidden';
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

      if (duration !== videoDuration) {
        setDuration(videoDuration);
      }

      const progressPercent = (currentTime / videoDuration) * 100;
      setProgress(progressPercent);

      // Update current subtitle for overlay (hide when ended)
      const activeSub = subtitles.find(
        (s) => currentTime >= s.startTime && currentTime <= s.endTime
      );
      setCurrentSubtitle(activeSub || null);

      // Update sidebar active subtitle (keep until next subtitle)
      if (activeSub) {
        setSidebarActiveSubtitle(activeSub);
      }
      // Don't clear sidebarActiveSubtitle when activeSub is null
      // It will be updated when the next subtitle starts
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current && !isNaN(duration) && duration > 0) {
      const seekPercent = parseFloat(e.target.value);
      const seekTime = (seekPercent / 100) * duration;
      const clampedSeekTime = Math.max(0, Math.min(seekTime, duration));
      videoRef.current.currentTime = clampedSeekTime;
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && !isNaN(duration) && duration > 0) {
      const progressBar = e.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickPercent = (clickX / rect.width) * 100;
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

  const handleSubtitleClick = (startTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    } else {
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }
  };

  const getSubtitleModeLabel = () => {
    if (subtitleMode === 'both') return 'EN + VI';
    if (subtitleMode === 'en') return 'EN';
    return 'OFF';
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
          onLoadedMetadata={(e) => {
            const video = e.currentTarget;
            if (!isNaN(video.duration)) {
              setDuration(video.duration);
            }
          }}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          crossOrigin="anonymous"
        >
          {subtitleEn && (
            <track
              kind="subtitles"
              src={subtitleEn}
              srcLang="en"
              label="English"
              default
            />
          )}
          {subtitleVi && (
            <track
              kind="subtitles"
              src={subtitleVi}
              srcLang="vi"
              label="Tiếng Việt"
            />
          )}
        </video>

        {/* Subtitle Overlay */}
        <SubtitleOverlay
          currentSubtitle={currentSubtitle}
          mode={subtitleMode}
          onPauseRequest={() => {
            if (videoRef.current) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }}
          movieId={movieId}
        />

        {/* Top Bar */}
        <div className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 z-20 ${showControls ? "opacity-100" : "opacity-0"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white rounded-full" onClick={() => router.back()}>
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-white font-bold text-lg md:text-xl">{title || "Video Player"}</h1>
                {subTitle && <p className="text-gray-300 text-sm">{subTitle}</p>}
              </div>
            </div>

            {/* Report Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-yellow-400 hover:bg-white/10 px-3 h-9 font-medium"
              onClick={() => setShowReportModal(true)}
              title="Báo lỗi video"
            >
              <Flag className="w-4 h-4 mr-2" />
              Báo Lỗi
            </Button>
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
        <div className="absolute inset-0 z-0" onClick={togglePlay} />

        {/* Bottom Controls */}
        <div className={`absolute bottom-0 left-0 right-0 px-4 pb-4 pt-12 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 z-20 ${showControls ? "opacity-100" : "opacity-0"}`}>
          {/* Time Display & Progress Bar Container */}
          <div className="w-full mb-4">
            {/* Time Labels */}
            <div className="flex justify-between text-sm font-medium text-gray-300 mb-2 px-1">
              <span>{formatTime(videoRef.current?.currentTime || 0)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Progress Bar */}
            <div
              className="relative w-full py-2 cursor-pointer group/progress"
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
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-yellow-500 hover:bg-white/10 rounded-full w-12 h-12 border-2 border-white hover:border-yellow-500 transition-all"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </Button>

              <Button variant="ghost" size="icon" className="text-white hover:text-yellow-500 rounded-full hover:bg-white/10" onClick={() => skip(-10)}>
                <svg width="396" height="430" viewBox="0 0 396 430" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g fill="currentColor">
                    <path d="M237.342 26.3129C243.281 20.3742 243.281 10.7449 237.342 4.80589C231.403 -1.13321 221.773 -1.13321 215.835 4.80589L178.779 41.8615C178.72 41.9187 178.661 41.9765 178.603 42.0348C175.633 45.0044 174.148 48.8971 174.149 52.7894C174.148 56.6821 175.633 60.5748 178.603 63.5444C178.661 63.6027 178.72 63.6605 178.779 63.7178L215.835 100.773C221.773 106.713 231.403 106.713 237.342 100.773C243.281 94.8342 243.281 85.205 237.342 79.2663L225.235 67.1593C254.972 72.106 283 85.0372 306.208 104.807C336.452 130.57 356.532 166.263 362.848 205.487C369.165 244.711 361.305 284.903 340.677 318.858C320.05 352.813 288.003 378.312 250.282 390.783C212.56 403.255 171.63 401.885 134.828 386.919C98.0256 371.951 67.7562 344.366 49.4459 309.108C31.1355 273.849 25.9816 233.222 34.9071 194.508C43.8326 155.794 66.2547 121.524 98.1538 97.8413C104.898 92.8343 106.306 83.3091 101.299 76.5649C96.2924 69.8212 86.7666 68.4135 80.0229 73.4199C42.3199 101.412 15.8181 141.916 5.26888 187.674C-5.28085 233.432 0.811443 281.452 22.4528 323.125C44.0947 364.8 79.8708 397.403 123.37 415.093C166.868 432.784 215.246 434.403 259.83 419.662C304.414 404.921 342.292 374.783 366.672 334.65C391.052 294.517 400.343 247.012 392.877 200.651C385.412 154.291 361.679 112.104 325.932 81.653C297.666 57.5743 263.349 42.0784 227.007 36.6477L237.342 26.3129Z">
                    </path>
                    <path d="M150.883 149.325C150.883 131.568 129.676 122.388 116.729 134.54L90.9877 158.701C84.8635 164.449 84.5588 174.073 90.3069 180.197C96.055 186.321 105.68 186.626 111.803 180.878L120.467 172.746V312.954C120.467 321.354 127.276 328.162 135.675 328.162C144.074 328.162 150.883 321.354 150.883 312.954V149.325Z">
                    </path>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M190.579 187.772C190.579 159.154 213.779 135.953 242.398 135.953C271.016 135.953 294.217 159.154 294.217 187.772V276.358C294.217 304.976 271.016 328.176 242.398 328.176C213.779 328.176 190.579 304.976 190.579 276.358V187.772ZM263.801 187.772V276.358C263.801 288.178 254.218 297.761 242.398 297.761C230.577 297.761 220.995 288.178 220.995 276.358V187.772C220.995 175.952 230.577 166.369 242.398 166.369C254.218 166.369 263.801 175.952 263.801 187.772Z">
                    </path>
                  </g>
                </svg>
              </Button>

              <Button variant="ghost" size="icon" className="text-xl text-white hover:text-yellow-500 rounded-full hover:bg-white/10" onClick={() => skip(10)}>
                <svg width="396" height="430" viewBox="0 0 396 430" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g fill="currentColor">
                    <path d="M158.267 26.3129C152.327 20.3742 152.327 10.7449 158.267 4.80589C164.206 -1.13321 173.835 -1.13321 179.774 4.80589L216.829 41.8615C216.889 41.9187 216.947 41.9765 217.005 42.0348C219.975 45.0044 221.46 48.8971 221.46 52.7894C221.46 56.6821 219.975 60.5748 217.005 63.5444C216.947 63.6027 216.889 63.6605 216.829 63.7178L179.774 100.773C173.835 106.713 164.206 106.713 158.267 100.773C152.327 94.8342 152.327 85.205 158.267 79.2663L170.374 67.1593C140.637 72.106 112.608 85.0372 89.4001 104.807C59.1561 130.57 39.0766 166.263 32.7602 205.487C26.4439 244.711 34.3038 284.903 54.9314 318.858C75.5589 352.813 107.605 378.312 145.327 390.783C183.048 403.255 223.978 401.885 260.781 386.919C297.583 371.951 327.852 344.366 346.163 309.108C364.473 273.849 369.627 233.222 360.701 194.508C351.776 155.794 329.354 121.524 297.455 97.8413C290.711 92.8343 289.303 83.3091 294.31 76.5649C299.316 69.8212 308.842 68.4135 315.585 73.4199C353.288 101.412 379.79 141.916 390.34 187.674C400.889 233.432 394.797 281.452 373.156 323.125C351.514 364.8 315.738 397.403 272.239 415.093C228.74 432.784 180.363 434.403 135.778 419.662C91.1941 404.921 53.3168 374.783 28.9365 334.65C4.55614 294.517 -4.73438 247.012 2.73119 200.651C10.1968 154.291 33.9297 112.104 69.6765 81.653C97.9424 57.5743 132.259 42.0784 168.601 36.6477L158.267 26.3129Z">
                    </path>
                    <path d="M150.883 149.325C150.883 131.568 129.676 122.388 116.729 134.54L90.9877 158.701C84.8635 164.449 84.5588 174.073 90.3069 180.197C96.055 186.321 105.68 186.626 111.803 180.878L120.467 172.746V312.954C120.467 321.354 127.276 328.162 135.675 328.162C144.074 328.162 150.883 321.354 150.883 312.954V149.325Z">
                    </path>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M190.579 187.772C190.579 159.154 213.779 135.953 242.398 135.953C271.016 135.953 294.217 159.154 294.217 187.772V276.358C294.217 304.976 271.016 328.176 242.398 328.176C213.779 328.176 190.579 304.976 190.579 276.358V187.772ZM263.801 187.772V276.358C263.801 288.178 254.218 297.761 242.398 297.761C230.577 297.761 220.995 288.178 220.995 276.358V187.772C220.995 175.952 230.577 166.369 242.398 166.369C254.218 166.369 263.801 175.952 263.801 187.772Z">
                    </path>
                  </g>
                </svg>
              </Button>

              <div className="flex items-center gap-3 group/volume">
                <Button variant="ghost" size="icon" className="text-white hover:text-yellow-500 w-10 h-10 rounded-full hover:bg-white/10" onClick={toggleMute}>
                  {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </Button>
                <div className="relative w-24 h-1 bg-white/20 rounded-full cursor-pointer group/slider flex items-center">
                  <div
                    className="absolute top-0 left-0 h-full bg-white rounded-full pointer-events-none"
                    style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                  />
                  <div
                    className="absolute w-3 h-3 bg-white rounded-full shadow-sm pointer-events-none"
                    style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 6px)` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

            </div>

            <div className="flex items-center gap-4">
              {/* Subtitle Mode Dropdown */}
              <div className="relative" ref={subtitleMenuRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`text-white hover:text-yellow-500 w-10 h-10 rounded-full hover:bg-white/10 ${subtitleMode !== 'off' ? 'text-yellow-500' : ''}`}
                  onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                  title="Chế độ phụ đề"
                >
                  <Subtitles className="w-6 h-6" />
                </Button>

                {/* Dropdown Menu */}
                {showSubtitleMenu && (
                  <div className="absolute bottom-full mb-2 right-0 bg-black/95 backdrop-blur-sm border border-white/10 rounded-lg shadow-xl overflow-hidden min-w-[160px] animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <button
                      onClick={() => {
                        setSubtitleMode('both');
                        setShowSubtitleMenu(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors cursor-pointer ${subtitleMode === 'both'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'text-white hover:bg-white/10'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <Subtitles className="w-4 h-4" />
                        <span>EN + VI</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setSubtitleMode('en');
                        setShowSubtitleMenu(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors cursor-pointer ${subtitleMode === 'en'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'text-white hover:bg-white/10'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <Subtitles className="w-4 h-4" />
                        <span>EN</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setSubtitleMode('off');
                        setShowSubtitleMenu(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors cursor-pointer ${subtitleMode === 'off'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'text-white hover:bg-white/10'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <Subtitles className="w-4 h-4" />
                        <span>OFF</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className={`text-white hover:text-yellow-500 w-10 h-10 rounded-full hover:bg-white/10 ${showSubtitleSidebar ? 'text-yellow-500' : ''}`}
                onClick={() => setShowSubtitleSidebar(!showSubtitleSidebar)}
                title="Danh sách phụ đề"
              >
                <List className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:text-yellow-500 w-10 h-10 rounded-full hover:bg-white/10" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Subtitle Sidebar */}
      <SubtitleSidebar
        subtitles={subtitles}
        currentSubtitle={sidebarActiveSubtitle}
        isOpen={showSubtitleSidebar}
        onClose={() => setShowSubtitleSidebar(false)}
        onSubtitleClick={handleSubtitleClick}
        formatTime={formatTime}
        mode={subtitleMode}
        movieId={movieId}
        onPauseRequest={() => {
          if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }}
      />

      {/* Report Issue Modal */}
      <ReportIssueModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        movieId={movieId || ""}
        movieTitle={title || "Unknown Movie"}
      />
    </div>
  );
}

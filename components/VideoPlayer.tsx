"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, SkipBack, ArrowLeft, List, Subtitles, Flag } from "lucide-react";
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
              {/* Subtitle Mode Dropdown */}
              <div className="relative" ref={subtitleMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-white hover:text-yellow-500 px-3 h-9 font-bold ${subtitleMode !== 'off' ? 'text-yellow-500 bg-white/10' : ''}`}
                  onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                  title="Chế độ phụ đề"
                >
                  <Subtitles className="w-5 h-5 mr-2" />
                  {getSubtitleModeLabel()}
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
                className={`text-white hover:text-yellow-500 ${showSubtitleSidebar ? 'text-yellow-500 bg-white/10' : ''}`}
                onClick={() => setShowSubtitleSidebar(!showSubtitleSidebar)}
                title="Danh sách phụ đề"
              >
                <List className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:text-yellow-500" onClick={toggleFullscreen}>
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

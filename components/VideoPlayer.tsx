"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, SkipBack, ArrowLeft, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  title?: string;
  subTitle?: string;
  subtitleEn?: string;
  subtitleVi?: string;
}

interface SubtitleCue {
  id: number;
  startTime: number;
  endTime: number;
  en: string;
  vi: string;
}

export function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  title,
  subTitle,
  subtitleEn,
  subtitleVi
}: VideoPlayerProps) {
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
  const [showSubtitleSidebar, setShowSubtitleSidebar] = useState(true);
  const [subtitles, setSubtitles] = useState<SubtitleCue[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleCue | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Parse VTT file
  const parseVTT = async (url: string): Promise<{ id: number; startTime: number; endTime: number; text: string }[]> => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      const lines = text.split('\n');
      const cues: { id: number; startTime: number; endTime: number; text: string }[] = [];

      let i = 0;
      let cueId = 0;

      while (i < lines.length) {
        const line = lines[i].trim();

        // Skip WEBVTT header and empty lines
        if (line === '' || line.startsWith('WEBVTT') || line.startsWith('NOTE')) {
          i++;
          continue;
        }

        // Check if this is a timestamp line
        if (line.includes('-->')) {
          const [startStr, endStr] = line.split('-->').map(s => s.trim());
          const startTime = parseVTTTime(startStr);
          const endTime = parseVTTTime(endStr);

          // Get subtitle text (may be multiple lines)
          i++;
          let text = '';
          while (i < lines.length && lines[i].trim() !== '') {
            text += (text ? ' ' : '') + lines[i].trim().replace(/<[^>]*>/g, ''); // Remove HTML tags
            i++;
          }

          if (text) {
            cues.push({
              id: cueId++,
              startTime,
              endTime,
              text
            });
          }
        }
        i++;
      }

      return cues;
    } catch (error) {
      console.error('Error parsing VTT:', error);
      return [];
    }
  };

  const parseVTTTime = (timeStr: string): number => {
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(seconds);
    } else if (parts.length === 2) {
      const [minutes, seconds] = parts;
      return parseInt(minutes) * 60 + parseFloat(seconds);
    }
    return 0;
  };

  // Load and merge subtitles
  useEffect(() => {
    const loadSubtitles = async () => {
      if (!subtitleEn && !subtitleVi) return;

      const [enCues, viCues] = await Promise.all([
        subtitleEn ? parseVTT(subtitleEn) : Promise.resolve([]),
        subtitleVi ? parseVTT(subtitleVi) : Promise.resolve([])
      ]);

      // Merge subtitles by matching timestamps
      const merged: SubtitleCue[] = [];
      const maxLength = Math.max(enCues.length, viCues.length);

      for (let i = 0; i < maxLength; i++) {
        const enCue = enCues[i];
        const viCue = viCues[i];

        if (enCue || viCue) {
          merged.push({
            id: i,
            startTime: enCue?.startTime || viCue?.startTime || 0,
            endTime: enCue?.endTime || viCue?.endTime || 0,
            en: enCue?.text || '',
            vi: viCue?.text || ''
          });
        }
      }

      setSubtitles(merged);
    };

    loadSubtitles();
  }, [subtitleEn, subtitleVi]);

  // Auto-scroll subtitle list to active item
  useEffect(() => {
    if (showSubtitleSidebar && currentSubtitle && subtitleListRef.current) {
      const activeElement = subtitleListRef.current.querySelector(`[data-id="${currentSubtitle.id}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentSubtitle, showSubtitleSidebar]);

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

    // Enable subtitles by default
    if (video.textTracks.length > 0) {
      video.textTracks[0].mode = 'showing';
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

      // Update current subtitle
      const sub = subtitles.find(
        (s) => currentTime >= s.startTime && currentTime <= s.endTime
      );
      setCurrentSubtitle(sub || null);
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
        {currentSubtitle && (
          <div className="absolute bottom-24 left-0 right-0 flex flex-col items-center px-8 z-10 pointer-events-none">
            {currentSubtitle.en && (
              <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-lg mb-2 max-w-4xl">
                <p className="text-white text-xl md:text-2xl font-semibold text-center leading-relaxed shadow-lg">
                  {currentSubtitle.en}
                </p>
              </div>
            )}
            {currentSubtitle.vi && (
              <div className="bg-black/70 backdrop-blur-sm px-6 py-2 rounded-lg max-w-4xl">
                <p className="text-yellow-400 text-base md:text-lg font-medium text-center leading-relaxed shadow-lg">
                  {currentSubtitle.vi}
                </p>
              </div>
            )}
          </div>
        )}

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
      <div
        className={`bg-slate-950 border-l border-slate-800 transition-all duration-300 ease-in-out flex flex-col ${showSubtitleSidebar ? "w-80 translate-x-0" : "w-0 translate-x-full opacity-0"
          }`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 z-10">
          <h3 className="text-slate-200 font-bold text-sm uppercase tracking-wider">Phụ đề song ngữ</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
            onClick={() => setShowSubtitleSidebar(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div ref={subtitleListRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {subtitles.map((sub) => (
            <div
              key={sub.id}
              data-id={sub.id}
              onClick={() => handleSubtitleClick(sub.startTime)}
              className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border group/item ${currentSubtitle?.id === sub.id
                ? "bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                : "bg-slate-900 border-transparent hover:bg-slate-800 hover:border-slate-700"
                }`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${currentSubtitle?.id === sub.id
                  ? "bg-yellow-500/20 text-yellow-500"
                  : "bg-slate-800 text-slate-500 group-hover/item:text-slate-400"
                  }`}>
                  {formatTime(sub.startTime)}
                </span>
              </div>
              {sub.en && (
                <p className={`text-base font-semibold mb-2 leading-relaxed ${currentSubtitle?.id === sub.id ? "text-yellow-400" : "text-slate-200 group-hover/item:text-white"
                  }`}>
                  {sub.en}
                </p>
              )}
              {sub.vi && (
                <p className={`text-sm font-medium leading-relaxed ${currentSubtitle?.id === sub.id ? "text-slate-300" : "text-slate-400 group-hover/item:text-slate-300"
                  }`}>
                  {sub.vi}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

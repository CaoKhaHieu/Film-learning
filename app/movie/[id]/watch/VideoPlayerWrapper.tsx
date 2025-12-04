"use client";

import { VideoPlayer } from "@/components/VideoPlayer";

interface Subtitle {
  id: number;
  startTime: number;
  endTime: number;
  en: string;
  vi: string;
}

interface VideoPlayerWrapperProps {
  src: string;
  title: string;
  poster?: string | null;
  subtitles: Subtitle[];
}

export function VideoPlayerWrapper({ src, title, poster, subtitles }: VideoPlayerWrapperProps) {
  return (
    <VideoPlayer
      src={src}
      title={title}
      poster={poster || undefined}
      subtitles={subtitles}
      autoPlay
    />
  );
}

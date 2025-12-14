import { BilingualSubtitle } from "@/lib/subtitle-parser";

interface SubtitleOverlayProps {
  currentSubtitle: BilingualSubtitle | null;
  mode: 'both' | 'en' | 'off';
  onPauseRequest?: () => void;
  movieId?: string;
}

export function SubtitleOverlay({ currentSubtitle, mode }: SubtitleOverlayProps) {
  if (!currentSubtitle || mode === 'off') return null;

  return (
    <div className="absolute bottom-24 left-0 right-0 flex flex-col items-center px-8 z-10 pointer-events-none">
      {currentSubtitle.en && (
        <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-lg mb-2 max-w-4xl">
          <p className="text-white text-xl md:text-2xl font-semibold text-center leading-relaxed shadow-lg">
            {currentSubtitle.en}
          </p>
        </div>
      )}
      {mode === 'both' && currentSubtitle.vi && (
        <div className="bg-black/70 backdrop-blur-sm px-6 py-2 rounded-lg max-w-4xl">
          <p className="text-yellow-400 text-base md:text-lg font-medium text-center leading-relaxed shadow-lg">
            {currentSubtitle.vi}
          </p>
        </div>
      )}
    </div>
  );
}

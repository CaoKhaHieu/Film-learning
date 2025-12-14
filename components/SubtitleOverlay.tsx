import { useState } from "react";
import { BilingualSubtitle } from "@/lib/subtitle-parser";
import { InteractiveSubtitle } from "./InteractiveSubtitle";
import { WordDefinitionModal } from "./WordDefinitionModal";

interface SubtitleOverlayProps {
  currentSubtitle: BilingualSubtitle | null;
  mode: 'both' | 'en' | 'off';
  onPauseRequest?: () => void;
  movieId?: string;
}

export function SubtitleOverlay({ currentSubtitle, mode, onPauseRequest, movieId }: SubtitleOverlayProps) {
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!currentSubtitle || mode === 'off') return null;

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
    setIsModalOpen(true);
    if (onPauseRequest) {
      onPauseRequest();
    }
  };

  return (
    <>
      <div className="absolute bottom-24 left-0 right-0 flex flex-col items-center px-8 z-10 pointer-events-none">
        {currentSubtitle.en && (
          <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-lg mb-2 max-w-4xl pointer-events-auto transition-transform hover:scale-105 duration-200">
            <div className="text-white text-xl md:text-2xl font-semibold text-center leading-relaxed shadow-lg">
              <InteractiveSubtitle
                text={currentSubtitle.en}
                onWordClick={handleWordClick}
              />
            </div>
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

      <WordDefinitionModal
        word={selectedWord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        movieId={movieId}
        contextSentence={currentSubtitle.en}
        contextSentenceVi={currentSubtitle.vi}
      />
    </>
  );
}

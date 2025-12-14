import { useEffect, useRef, useState, useCallback } from "react";
import { X, ChevronDown, ChevronUp, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BilingualSubtitle } from "@/lib/subtitle-parser";
import { InteractiveSubtitle } from "./InteractiveSubtitle";
import { WordDefinitionModal } from "./WordDefinitionModal";
import { Virtuoso, VirtuosoHandle, ListRange } from 'react-virtuoso';

interface SubtitleSidebarProps {
  subtitles: BilingualSubtitle[];
  currentSubtitle: BilingualSubtitle | null;
  isOpen: boolean;
  onClose: () => void;
  onSubtitleClick: (startTime: number) => void;
  formatTime: (time: number) => string;
  mode: 'both' | 'en' | 'off';
  movieId?: string;
  onPauseRequest?: () => void;
}

type Theme = 'light' | 'dark';

export function SubtitleSidebar({
  subtitles,
  currentSubtitle,
  isOpen,
  onClose,
  onSubtitleClick,
  formatTime,
  mode,
  movieId,
  onPauseRequest
}: SubtitleSidebarProps) {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [showBackButton, setShowBackButton] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [theme, setTheme] = useState<Theme>('dark');

  // Refs for state management without re-renders
  const isAutoScrolling = useRef(false);
  const visibleRange = useRef<ListRange>({ startIndex: 0, endIndex: 0 });
  const lastSubtitleId = useRef<number | null>(null);

  // Modal state
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<string>("");
  const [modalContextVi, setModalContextVi] = useState<string>("");

  const handleWordClick = (word: string, context: string, contextVi?: string) => {
    if (onPauseRequest) {
      onPauseRequest();
    }
    setSelectedWord(word);
    setModalContext(context);
    setModalContextVi(contextVi || "");
    setIsModalOpen(true);
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('subtitle-sidebar-theme') as Theme;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
  }, []);

  // Toggle theme and save to localStorage
  const toggleTheme = () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('subtitle-sidebar-theme', newTheme);
  };

  // Theme-based styles
  const themeStyles = {
    light: {
      container: "bg-white border-slate-200 shadow-2xl",
      header: "bg-white border-slate-200",
      headerText: "text-slate-900",
      closeButton: "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
      themeButton: "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
      scrollbar: "scrollbar-thumb-slate-300 scrollbar-track-slate-100",
      itemActive: "bg-yellow-50 border-yellow-400 shadow-lg shadow-yellow-400/20",
      itemInactive: "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 hover:shadow-md",
      timestampActive: "bg-yellow-400 text-white",
      timestampInactive: "bg-slate-200 text-slate-700 group-hover/item:bg-slate-300",
      textEnActive: "text-slate-900",
      textEnInactive: "text-slate-700 group-hover/item:text-slate-900",
      textViActive: "text-slate-600",
      textViInactive: "text-slate-500 group-hover/item:text-slate-700",
    },
    dark: {
      container: "bg-black border-zinc-800 shadow-2xl",
      header: "bg-black border-zinc-800",
      headerText: "text-zinc-100",
      closeButton: "text-zinc-400 hover:text-white hover:bg-zinc-900",
      themeButton: "text-zinc-400 hover:text-white hover:bg-zinc-900",
      scrollbar: "scrollbar-thumb-zinc-700 scrollbar-track-zinc-950",
      itemActive: "bg-yellow-500/15 border-yellow-500/60 shadow-[0_0_20px_rgba(234,179,8,0.15)]",
      itemInactive: "bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-800/60 hover:border-zinc-700/60 hover:shadow-md",
      timestampActive: "bg-yellow-500/25 text-yellow-400 border border-yellow-500/30",
      timestampInactive: "bg-zinc-800/80 text-zinc-400 group-hover/item:text-zinc-300 group-hover/item:bg-zinc-700/80",
      textEnActive: "text-yellow-400",
      textEnInactive: "text-zinc-100 group-hover/item:text-white",
      textViActive: "text-zinc-300",
      textViInactive: "text-zinc-400 group-hover/item:text-zinc-300",
    }
  };

  const styles = themeStyles[theme];

  // Helper to check visibility
  const checkVisibility = useCallback(() => {
    if (!currentSubtitle) return;

    const index = subtitles.findIndex(s => s.id === currentSubtitle.id);
    if (index === -1) return;

    const { startIndex, endIndex } = visibleRange.current;

    // Check if the subtitle is within the visible range
    // We add a small buffer to ensure it's comfortably visible
    const isVisible = index >= startIndex && index <= endIndex;

    if (!isVisible && !isAutoScrolling.current) {
      setShowBackButton(true);
      // Determine direction
      setScrollDirection(index < startIndex ? 'up' : 'down');
    } else {
      setShowBackButton(false);
    }
  }, [currentSubtitle, subtitles]);

  // Handle range changes from Virtuoso
  const handleRangeChanged = (range: ListRange) => {
    visibleRange.current = range;
    // Only check visibility if we are NOT auto-scrolling
    if (!isAutoScrolling.current) {
      checkVisibility();
    }
  };

  // Auto-scroll logic
  useEffect(() => {
    if (!isOpen || !currentSubtitle || !virtuosoRef.current) return;

    const index = subtitles.findIndex(s => s.id === currentSubtitle.id);
    if (index === -1) return;

    // Detect if this is a seek (large jump) or just next subtitle
    const prevId = lastSubtitleId.current;
    const prevIndex = prevId !== null ? subtitles.findIndex(s => s.id === prevId) : -1;
    const isSequential = prevIndex !== -1 && Math.abs(index - prevIndex) <= 1;

    lastSubtitleId.current = currentSubtitle.id;

    // If it's a seek (non-sequential) OR we are in "follow mode" (back button hidden), auto-scroll
    if (!isSequential || !showBackButton) {
      isAutoScrolling.current = true;

      virtuosoRef.current.scrollToIndex({
        index,
        align: 'center',
        behavior: 'smooth'
      });

      // Reset auto-scrolling flag after animation
      // We use a timeout slightly longer than standard smooth scroll duration
      setTimeout(() => {
        isAutoScrolling.current = false;
        // Re-check visibility after scroll finishes to ensure button state is correct
        checkVisibility();
      }, 800);
    }
  }, [currentSubtitle, isOpen, subtitles, showBackButton, checkVisibility]);

  // Scroll to current subtitle when button clicked
  const scrollToCurrent = () => {
    if (!currentSubtitle || !virtuosoRef.current) return;

    const index = subtitles.findIndex(s => s.id === currentSubtitle.id);
    if (index !== -1) {
      isAutoScrolling.current = true;
      setShowBackButton(false); // Hide button immediately

      virtuosoRef.current.scrollToIndex({
        index,
        align: 'center',
        behavior: 'smooth'
      });

      setTimeout(() => {
        isAutoScrolling.current = false;
      }, 800);
    }
  };

  // Reset state when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      setShowBackButton(false);
      isAutoScrolling.current = false;
    }
  }, [isOpen]);

  return (
    <>
      <div
        className={`${styles.container} border-l transition-all duration-300 ease-in-out flex flex-col relative ${isOpen ? "w-80 translate-x-0" : "w-0 translate-x-full opacity-0"
          }`}
      >
        {/* Header */}
        <div className={`p-4 border-b ${styles.header} flex items-center justify-between z-10`}>
          <h3 className={`${styles.headerText} font-bold text-sm uppercase tracking-wider`}>
            {mode === 'both' ? 'Phụ đề song ngữ' : mode === 'en' ? 'Phụ đề tiếng Anh' : 'Phụ đề (Tắt)'}
          </h3>
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${styles.themeButton} rounded-full`}
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${styles.closeButton} rounded-full`}
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Subtitle List */}
        <div className="flex-1 overflow-hidden relative">
          <Virtuoso
            ref={virtuosoRef}
            data={subtitles}
            className={`h-full ${styles.scrollbar}`}
            rangeChanged={handleRangeChanged}
            itemContent={(index, sub) => (
              <div
                key={sub.id}
                data-id={sub.id}
                onClick={() => onSubtitleClick(sub.startTime)}
                className={`mx-4 my-1.5 p-3 rounded-xl cursor-pointer transition-all duration-200 border group/item ${currentSubtitle?.id === sub.id
                  ? styles.itemActive
                  : styles.itemInactive
                  }`}
              >
                {/* Timestamp */}
                <div className="flex justify-between items-start mb-1.5">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${currentSubtitle?.id === sub.id
                      ? styles.timestampActive
                      : styles.timestampInactive
                      }`}
                  >
                    {formatTime(sub.startTime)}
                  </span>
                </div>

                {/* English Subtitle */}
                {sub.en && (
                  <div
                    className={`text-base font-semibold mb-2 leading-relaxed ${currentSubtitle?.id === sub.id
                      ? styles.textEnActive
                      : styles.textEnInactive
                      }`}
                  >
                    <InteractiveSubtitle
                      text={sub.en}
                      onWordClick={(word) => handleWordClick(word, sub.en, sub.vi)}
                    />
                  </div>
                )}

                {/* Vietnamese Subtitle */}
                {mode === 'both' && sub.vi && (
                  <p
                    className={`text-sm font-medium leading-relaxed ${currentSubtitle?.id === sub.id
                      ? styles.textViActive
                      : styles.textViInactive
                      }`}
                  >
                    {sub.vi}
                  </p>
                )}
              </div>
            )}
          />

          {/* Floating Back to Current Button */}
          {showBackButton && currentSubtitle && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Button
                onClick={scrollToCurrent}
                className="h-12 w-12 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                size="icon"
                title={scrollDirection === 'up' ? 'Quay về phụ đề hiện tại (bên trên)' : 'Quay về phụ đề hiện tại (bên dưới)'}
              >
                {scrollDirection === 'up' ? (
                  <ChevronUp className="w-6 h-6" />
                ) : (
                  <ChevronDown className="w-6 h-6" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <WordDefinitionModal
        word={selectedWord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        movieId={movieId}
        contextSentence={modalContext}
        contextSentenceVi={modalContextVi}
      />
    </>
  );
}

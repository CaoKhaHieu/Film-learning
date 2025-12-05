import { useEffect, useRef, useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BilingualSubtitle } from "@/lib/subtitle-parser";

interface SubtitleSidebarProps {
  subtitles: BilingualSubtitle[];
  currentSubtitle: BilingualSubtitle | null;
  isOpen: boolean;
  onClose: () => void;
  onSubtitleClick: (startTime: number) => void;
  formatTime: (time: number) => string;
}

export function SubtitleSidebar({
  subtitles,
  currentSubtitle,
  isOpen,
  onClose,
  onSubtitleClick,
  formatTime
}: SubtitleSidebarProps) {
  const subtitleListRef = useRef<HTMLDivElement>(null);
  const [showBackButton, setShowBackButton] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTop = useRef(0);
  const isAutoScrolling = useRef(false);

  // Check if current subtitle is in view
  const isCurrentSubtitleInView = (): boolean => {
    if (!currentSubtitle || !subtitleListRef.current) return true;

    const activeElement = subtitleListRef.current.querySelector(
      `[data-id="${currentSubtitle.id}"]`
    ) as HTMLElement;

    if (!activeElement) return true;

    const containerRect = subtitleListRef.current.getBoundingClientRect();
    const elementRect = activeElement.getBoundingClientRect();

    // Check if element is in the middle 60% of the container (comfortable viewing area)
    const containerMiddleStart = containerRect.top + containerRect.height * 0.2;
    const containerMiddleEnd = containerRect.top + containerRect.height * 0.8;

    return elementRect.top >= containerMiddleStart && elementRect.bottom <= containerMiddleEnd;
  };

  // Detect user manual scroll and direction
  useEffect(() => {
    const handleScroll = () => {
      if (!subtitleListRef.current || isAutoScrolling.current) return;

      const currentScrollTop = subtitleListRef.current.scrollTop;
      const scrollDelta = currentScrollTop - lastScrollTop.current;

      // Only detect significant scroll (> 10px to avoid jitter)
      if (Math.abs(scrollDelta) > 10) {
        // Determine scroll direction
        setScrollDirection(scrollDelta > 0 ? 'down' : 'up');

        // Check if current subtitle is still in view
        const inView = isCurrentSubtitleInView();
        setShowBackButton(!inView);

        // Clear existing timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // Hide button after 5 seconds of no scrolling if subtitle is in view
        scrollTimeoutRef.current = setTimeout(() => {
          if (isCurrentSubtitleInView()) {
            setShowBackButton(false);
          }
        }, 5000);
      }

      lastScrollTop.current = currentScrollTop;
    };

    const listElement = subtitleListRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (listElement) {
        listElement.removeEventListener('scroll', handleScroll);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentSubtitle]);

  // Auto-scroll to active subtitle (only when button is not showing)
  useEffect(() => {
    if (isOpen && currentSubtitle && subtitleListRef.current && !showBackButton) {
      const activeElement = subtitleListRef.current.querySelector(
        `[data-id="${currentSubtitle.id}"]`
      );

      if (activeElement && !isCurrentSubtitleInView()) {
        isAutoScrolling.current = true;
        activeElement.scrollIntoView({ behavior: "smooth", block: "center" });

        // Clear existing timeout
        if (autoScrollTimeoutRef.current) {
          clearTimeout(autoScrollTimeoutRef.current);
        }

        // Reset auto-scrolling flag after animation
        autoScrollTimeoutRef.current = setTimeout(() => {
          isAutoScrolling.current = false;
        }, 1000);
      }
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }
    };
  }, [currentSubtitle, isOpen, showBackButton]);

  // Scroll to current subtitle when button clicked
  const scrollToCurrent = () => {
    if (!currentSubtitle || !subtitleListRef.current) return;

    const activeElement = subtitleListRef.current.querySelector(
      `[data-id="${currentSubtitle.id}"]`
    );

    if (activeElement) {
      isAutoScrolling.current = true;
      activeElement.scrollIntoView({ behavior: "smooth", block: "center" });

      // Hide button immediately
      setShowBackButton(false);

      // Clear existing timeout
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }

      // Reset auto-scrolling flag after animation
      autoScrollTimeoutRef.current = setTimeout(() => {
        isAutoScrolling.current = false;
      }, 1000);
    }
  };

  // Reset state when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      setShowBackButton(false);
      lastScrollTop.current = 0;

      // Clear all timeouts when closing
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
        autoScrollTimeoutRef.current = null;
      }
    }
  }, [isOpen]);

  return (
    <div
      className={`bg-slate-950 border-l border-slate-800 transition-all duration-300 ease-in-out flex flex-col relative ${isOpen ? "w-80 translate-x-0" : "w-0 translate-x-full opacity-0"
        }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 z-10">
        <h3 className="text-slate-200 font-bold text-sm uppercase tracking-wider">
          Phụ đề song ngữ
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Subtitle List */}
      <div
        ref={subtitleListRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
      >
        {subtitles.map((sub) => (
          <div
            key={sub.id}
            data-id={sub.id}
            onClick={() => onSubtitleClick(sub.startTime)}
            className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border group/item ${currentSubtitle?.id === sub.id
              ? "bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
              : "bg-slate-900 border-transparent hover:bg-slate-800 hover:border-slate-700"
              }`}
          >
            {/* Timestamp */}
            <div className="flex justify-between items-start mb-1.5">
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${currentSubtitle?.id === sub.id
                  ? "bg-yellow-500/20 text-yellow-500"
                  : "bg-slate-800 text-slate-500 group-hover/item:text-slate-400"
                  }`}
              >
                {formatTime(sub.startTime)}
              </span>
            </div>

            {/* English Subtitle */}
            {sub.en && (
              <p
                className={`text-base font-semibold mb-2 leading-relaxed ${currentSubtitle?.id === sub.id
                  ? "text-yellow-400"
                  : "text-slate-200 group-hover/item:text-white"
                  }`}
              >
                {sub.en}
              </p>
            )}

            {/* Vietnamese Subtitle */}
            {sub.vi && (
              <p
                className={`text-sm font-medium leading-relaxed ${currentSubtitle?.id === sub.id
                  ? "text-slate-300"
                  : "text-slate-400 group-hover/item:text-slate-300"
                  }`}
              >
                {sub.vi}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Floating Back to Current Button */}
      {showBackButton && currentSubtitle && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Button
            onClick={scrollToCurrent}
            className="h-12 w-12 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            size="icon"
            title={scrollDirection === 'up' ? 'Quay về phụ đề hiện tại (bên dưới)' : 'Quay về phụ đề hiện tại (bên trên)'}
          >
            {scrollDirection === 'up' ? (
              <ChevronDown className="w-6 h-6" />
            ) : (
              <ChevronUp className="w-6 h-6" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

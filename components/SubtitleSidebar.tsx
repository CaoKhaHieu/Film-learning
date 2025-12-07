import { useEffect, useRef, useState } from "react";
import { X, ChevronDown, ChevronUp, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BilingualSubtitle } from "@/lib/subtitle-parser";

interface SubtitleSidebarProps {
  subtitles: BilingualSubtitle[];
  currentSubtitle: BilingualSubtitle | null;
  isOpen: boolean;
  onClose: () => void;
  onSubtitleClick: (startTime: number) => void;
  formatTime: (time: number) => string;
  mode: 'both' | 'en' | 'off';
}

type Theme = 'light' | 'dark';

export function SubtitleSidebar({
  subtitles,
  currentSubtitle,
  isOpen,
  onClose,
  onSubtitleClick,
  formatTime,
  mode
}: SubtitleSidebarProps) {
  const subtitleListRef = useRef<HTMLDivElement>(null);
  const [showBackButton, setShowBackButton] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [theme, setTheme] = useState<Theme>('dark');
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTop = useRef(0);
  const isAutoScrolling = useRef(false);

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
      <div
        ref={subtitleListRef}
        className={`flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin ${styles.scrollbar}`}
      >
        {subtitles.map((sub) => (
          <div
            key={sub.id}
            data-id={sub.id}
            onClick={() => onSubtitleClick(sub.startTime)}
            className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border group/item ${currentSubtitle?.id === sub.id
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
              <p
                className={`text-base font-semibold mb-2 leading-relaxed ${currentSubtitle?.id === sub.id
                  ? styles.textEnActive
                  : styles.textEnInactive
                  }`}
              >
                {sub.en}
              </p>
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

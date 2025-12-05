import { useEffect, useRef } from "react";
import { X } from "lucide-react";
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

  // Auto-scroll to active subtitle
  useEffect(() => {
    if (isOpen && currentSubtitle && subtitleListRef.current) {
      const activeElement = subtitleListRef.current.querySelector(
        `[data-id="${currentSubtitle.id}"]`
      );
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentSubtitle, isOpen]);

  return (
    <div
      className={`bg-slate-950 border-l border-slate-800 transition-all duration-300 ease-in-out flex flex-col ${isOpen ? "w-80 translate-x-0" : "w-0 translate-x-full opacity-0"
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
    </div>
  );
}

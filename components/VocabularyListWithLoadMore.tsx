"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSavedWords, SavedWord, deleteSavedWord } from '@/service/vocabulary';
import { Loader2, Trash2, PlayCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface VocabularyListWithLoadMoreProps {
  initialWords: SavedWord[];
  userId: string;
  itemsPerPage?: number;
}

export function VocabularyListWithLoadMore({
  initialWords,
  userId,
  itemsPerPage = 20,
}: VocabularyListWithLoadMoreProps) {
  const [words, setWords] = useState<SavedWord[]>(initialWords);
  const [offset, setOffset] = useState(itemsPerPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialWords.length >= itemsPerPage);
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const newWords = await getSavedWords(userId, offset, itemsPerPage);

      if (newWords.length === 0) {
        setHasMore(false);
      } else {
        setWords((prev) => [...prev, ...newWords]);
        setOffset((prev) => prev + itemsPerPage);

        if (newWords.length < itemsPerPage) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error loading more words:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [userId, offset, itemsPerPage, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          loadMore();
        }
      },
      { threshold: 0, rootMargin: '400px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore, hasMore]);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteSavedWord(deleteId);
      setWords((prev) => prev.filter((w) => w.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting word:', error);
      alert('Có lỗi xảy ra khi xóa');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      {words.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {words.map((item, index) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow animate-fadeIn"
              style={{
                animationDelay: `${(index % itemsPerPage) * 50}ms`,
                animationFillMode: 'backwards'
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-bold text-slate-900">{item.word}</h3>
                    <button
                      onClick={() => handleSpeak(item.word)}
                      className="text-slate-400 hover:text-yellow-500 transition-colors cursor-pointer"
                      title="Nghe phát âm"
                    >
                      <VolumeIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-lg text-slate-700 font-medium">{item.translation}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 -mr-2 -mt-2"
                  onClick={() => handleDeleteClick(item.id)}
                  title="Xóa"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>

              {item.context_sentence && (
                <div className="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-100">
                  <p className="text-sm text-slate-600 italic">"{item.context_sentence}"</p>
                </div>
              )}

              {item.movies && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <PlayCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-500 truncate">{item.movies.title}</span>
                  </div>
                  {item.movie_id && (
                    <Link
                      href={`/movie/${item.movie_id}/watch`}
                      className="text-xs font-medium text-yellow-600 hover:text-yellow-700 flex items-center gap-1 ml-2 flex-shrink-0"
                    >
                      Xem lại <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpenIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có từ vựng nào</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Hãy xem phim và lưu lại những từ mới bạn muốn học. Chúng sẽ xuất hiện tại đây.
          </p>
          <div className="mt-6">
            <Link href="/">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                Khám phá phim ngay
              </Button>
            </Link>
          </div>
        </div>
      )}

      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-12 min-h-[100px]">
          {loading && (
            <div className="flex items-center gap-3 text-slate-600 animate-fadeIn">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Đang tải thêm...</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && words.length > 0 && (
        <div className="text-center py-8 text-slate-400 text-sm">
          Đã hiển thị tất cả từ vựng
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Xác nhận xóa</h3>
            <p className="text-slate-600 mb-6">Bạn có chắc chắn muốn xóa từ vựng này khỏi sổ tay không? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  'Xóa'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function VolumeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

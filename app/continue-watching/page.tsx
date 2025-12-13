"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MovieCard } from "@/components/MovieCard";

interface WatchingMovie {
  movie_id: string;
  watched_time: number;
  duration: number;
  updated_at: string;
  movies: {
    id: string;
    title: string;
    title_vi: string | null;
    poster: string | null;
    background_image: string | null;
    is_vip: boolean;
    overview: string | null;
  };
}

export default function ContinueWatchingPage() {
  const [movies, setMovies] = useState<WatchingMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 20;
  const supabase = createClient();
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const fetchMovies = useCallback(async (reset = false) => {
    if (loadingRef.current || (!hasMore && !reset)) return;

    loadingRef.current = true;
    if (reset) setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      const currentPage = reset ? 0 : page;
      const from = currentPage * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from("watch_progress")
        .select(`
          movie_id,
          watched_time,
          duration,
          updated_at,
          movies (
            id,
            title,
            title_vi,
            poster,
            background_image,
            is_vip,
            overview
          )
        `)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data) {
        const validMovies = data.filter(item => item.movies) as unknown as WatchingMovie[];

        if (reset) {
          setMovies(validMovies);
          setPage(1);
        } else {
          setMovies(prev => [...prev, ...validMovies]);
          setPage(prev => prev + 1);
        }

        if (validMovies.length < ITEMS_PER_PAGE) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [page, hasMore]);

  useEffect(() => {
    fetchMovies(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current && !loading) {
          fetchMovies(false);
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
  }, [fetchMovies, hasMore, loading]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight flex items-center gap-3">
            <Clock className="w-10 h-10 text-yellow-500" />
            Đang Xem Dở
          </h1>
          <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
            Tiếp tục hành trình học tiếng Anh của bạn. Xem lại những bộ phim bạn đang theo dõi và đừng bỏ lỡ bất kỳ khoảnh khắc nào.
          </p>
        </div>

        {loading && movies.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-yellow-500 rounded-full animate-spin"></div>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-slate-100">
              <Play className="h-10 w-10 text-slate-400 ml-1" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Chưa có phim nào đang xem</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Hãy bắt đầu xem một bộ phim để lưu lại tiến độ tại đây.
            </p>
            <Link href="/">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold">
                Khám phá phim ngay
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((item, index) => {
                const movie = item.movies;
                const progressPercent = item.duration > 0
                  ? Math.min(100, Math.max(0, (item.watched_time / item.duration) * 100))
                  : 0;

                return (
                  <div
                    key={movie.id}
                    className="animate-fadeIn will-change-[opacity]"
                    style={{
                      animationDelay: `${(index % ITEMS_PER_PAGE) * 20}ms`,
                      animationFillMode: 'backwards'
                    }}
                  >
                    <MovieCard
                      id={movie.id}
                      title={movie.title}
                      title_vi={movie.title_vi}
                      image={movie.background_image || movie.poster || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=500&q=60"}
                      progress={progressPercent}
                      className="w-full"
                      year={new Date(item.updated_at).toLocaleDateString('vi-VN')}
                    />
                  </div>
                );
              })}
            </div>

            {/* Loading indicator and observer target */}
            {hasMore && (
              <div ref={observerTarget} className="flex justify-center py-12 min-h-[100px]">
                <div className="flex items-center gap-3 text-slate-600 animate-fadeIn">
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Đang tải thêm phim...</span>
                </div>
              </div>
            )}

            {/* End of list message */}
            {!hasMore && movies.length > 0 && (
              <div className="text-center py-8 animate-fadeIn">
                <p className="text-slate-500 text-sm">Đã hiển thị tất cả phim đang xem</p>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}

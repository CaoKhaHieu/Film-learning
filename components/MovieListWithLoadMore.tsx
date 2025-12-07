'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MovieCard } from './MovieCard';
import { transformMovieForRow } from '@/service/movie-utils';
import { getAllMoviesByDifficulty } from '@/service/movie';
import type { Movie } from '@/lib/supabase-server';

interface MovieListWithLoadMoreProps {
  initialMovies: Movie[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  itemsPerPage?: number;
}

export function MovieListWithLoadMore({
  initialMovies,
  difficulty,
  itemsPerPage = 20,
}: MovieListWithLoadMoreProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [offset, setOffset] = useState(itemsPerPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialMovies.length >= itemsPerPage);
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false); // Prevent duplicate calls

  const loadMore = useCallback(async () => {
    // Prevent duplicate calls
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const newMovies = await getAllMoviesByDifficulty(difficulty, offset, itemsPerPage);

      if (newMovies.length === 0) {
        setHasMore(false);
      } else {
        setMovies((prev) => [...prev, ...newMovies]);
        setOffset((prev) => prev + itemsPerPage);

        // If we got fewer movies than requested, we've reached the end
        if (newMovies.length < itemsPerPage) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error loading more movies:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [difficulty, offset, itemsPerPage, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          loadMore();
        }
      },
      {
        threshold: 0,
        rootMargin: '400px' // Load 400px before reaching the trigger element
      }
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

  return (
    <>
      {/* Movies Grid */}
      {movies.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              className="animate-fadeIn will-change-[opacity]"
              style={{
                animationDelay: `${(index % itemsPerPage) * 20}ms`,
                animationFillMode: 'backwards'
              }}
            >
              <MovieCard {...transformMovieForRow(movie)} className="w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-500 text-lg">Chưa có phim nào trong danh mục này.</p>
        </div>
      )}

      {/* Loading indicator and observer target */}
      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-12 min-h-[100px]">
          {loading && (
            <div className="flex items-center gap-3 text-slate-600 animate-fadeIn">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Đang tải thêm phim...</span>
            </div>
          )}
        </div>
      )}

      {/* End of list message */}
      {!hasMore && movies.length > 0 && (
        <div className="text-center py-8 animate-fadeIn">
          <p className="text-slate-500 text-sm">Đã hiển thị tất cả phim</p>
        </div>
      )}
    </>
  );
}

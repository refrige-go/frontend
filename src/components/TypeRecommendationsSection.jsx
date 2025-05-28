'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Suspense } from 'react';
import BookmarkCard from '../components/BookmarkCard';
import axiosInstance from '../api/axiosInstance';

export default function TypeRecommendationsSection({ userId, onBookmark, onUnbookmark }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });

  const scrollContainerRef = useRef(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/bookmark/bookmark-recommend');
      setRecipes(res.data.slice(0, 7));
    } catch (error) {
      console.error('추천 레시피 가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [userId, fetchRecommendations]);

  const handleBookmark = async (recipeId) => {
    await onBookmark(recipeId);
    setRecipes((prev) => prev.filter((r) => r.rcpSeq !== recipeId));
  };

  const handleUnbookmark = async (recipeId) => {
    await onUnbookmark(recipeId);
    fetchRecommendations();
  };

  const dragHandlers = {
    onMouseDown: (e) => {
      setIsDragging(true);
      setDragStart({
        x: e.pageX - scrollContainerRef.current.offsetLeft,
        scrollLeft: scrollContainerRef.current.scrollLeft,
      });
    },
    onMouseUp: () => setIsDragging(false),
    onMouseLeave: () => setIsDragging(false),
    onMouseMove: (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - dragStart.x) * 2;
      scrollContainerRef.current.scrollLeft = dragStart.scrollLeft - walk;
    },
  };

  if (loading) return <p>불러오는 중입니다...</p>;
  if (recipes.length === 0) return null;

  return (
    <Suspense fallback={<p>로딩 중...</p>}>
      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
          사용자님의 취향 저격 레시피를 모아봤어요!
        </h2>

        <div
          ref={scrollContainerRef}
          className="scroll-container no-scrollbar"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          {...dragHandlers}
        >
          {recipes.map((recipe) => (
            <div className="slide-item" key={recipe.rcpSeq}>
              <BookmarkCard
                recipe={{
                  ...recipe,
                  bookmarked: recipe.bookmarked
                }}
                userId={userId}
                onUnbookmark={handleUnbookmark}
                onBookmark={handleBookmark}
              />
            </div>
          ))}
        </div>

        <style jsx>{`
        .scroll-container {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          gap: 16px;
          padding-bottom: 1rem;
          user-select: none;
        }

        .slide-item {
          flex: 0 0 auto;
          scroll-snap-align: start;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      </section>
    </Suspense>
  );
}

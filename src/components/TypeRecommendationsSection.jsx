'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import BookmarkCard from '../components/BookmarkCard';
import axiosInstance from '../api/axiosInstance';

export default function TypeRecommendationsSection({ userId, onBookmark, onUnbookmark }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });
  const [error, setError] = useState(null);

  const scrollContainerRef = useRef(null);

  const fetchRecommendations = useCallback(async () => {
    if (!userId) {
      console.log('[TypeRecommendationsSection] userId가 없어서 요청하지 않음');
      setLoading(false);
      return;
    }

    console.log('[TypeRecommendationsSection] API 요청 시작, userId:', userId);
    setLoading(true);
    setError(null);
    
    try {
      const res = await axiosInstance.get('/api/bookmark/bookmark-recommend');
      console.log('[TypeRecommendationsSection] API 응답 성공:', res.data);
      const recipesData = res.data || [];
      setRecipes(Array.isArray(recipesData) ? recipesData.slice(0, 7) : []);
    } catch (error) {
      console.error('[TypeRecommendationsSection] API 에러:', error);
      setError(error.message || '알 수 없는 에러');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

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

  // 로그인 상태일 때만 섹션 표시
  if (!userId) {
    return null;
  }

  // 로딩 중이거나 레시피가 없으면 섹션을 표시하지 않음
  if (loading || (!loading && recipes.length === 0)) {
    return null;
  }

  return (
    <section style={{ marginTop: '2rem' }}>
      <h2 style={{ 
        fontSize: '1.2rem', 
        marginBottom: '1rem',
        fontWeight: '600',
        color: '#333'
      }}>
        사용자님의 취향 저격 레시피를 모아봤어요!
      </h2>

      {error && (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          color: '#666',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          margin: '1rem 0'
        }}>
          추천 레시피를 불러오는 중 문제가 발생했습니다.
        </div>
      )}

      {!error && recipes.length > 0 && (
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
      )}

      <style jsx>{`
        .scroll-container {
          display: flex;
          overflow-x: auto;
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
  );
}

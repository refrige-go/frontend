'use client';

import { useEffect, useState, useRef } from 'react';
import BookmarkCard from '../components/BookmarkCard';
import axiosInstance from '../api/axiosInstance';

export default function IngredientRecommendationsSection({ userId, bookmarkedIds, onBookmark, onUnbookmark }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get('/api/bookmark/ingredient-recommend');

      setRecipes(res.data.slice(0, 7));
    } catch (error) {
      console.error('에러:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [userId]);

  const handleBookmark = async (recipeId) => {
    await onBookmark(recipeId);
    fetchRecommendations();
  };

  const handleUnbookmark = async (recipeId) => {
    await onUnbookmark(recipeId);
    fetchRecommendations();
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // 스크롤 속도 조절
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  if (loading) return <p>불러오는 중입니다...</p>;
  if (recipes.length === 0) return null;

  return (
    <section style={{ marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>냉장고 재료로 만들 수 있는 저장된 레시피예요!</h2>
      <div
        ref={scrollContainerRef}
        className="scroll-container no-scrollbar"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {recipes.map((recipe) => (
          <div className="slide-item" key={recipe.rcpSeq}>
            <BookmarkCard
              recipe={{
                ...recipe,
                bookmarked: recipe.bookmarked
              }}
              userId={userId}
              onBookmark={handleBookmark}
              onUnbookmark={handleUnbookmark}
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
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
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

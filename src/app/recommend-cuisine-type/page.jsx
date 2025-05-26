'use client';

import { useEffect, useState, useRef } from 'react';
import BookmarkCard from '../../components/BookmarkCard';

export default function TypeRecommendationsPage({ bookmarkedIds, onBookmark, onUnbookmark }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef(null);

  const userId = 1; // 실제 로그인 유저 ID로 바꾸세요

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/api/bookmark/bookmark-recommend?userId=${userId}`);
      if (!res.ok) throw new Error('추천 목록을 불러오는 데 실패했습니다.');
      const data = await res.json();
      setRecipes(data.slice(0, 7)); // 최대 7개만 보여주기
    } catch (error) {
      console.error('에러:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

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
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>사용자님의 취향 저격 레시피를 모아봤어요!</h2>
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
              key={recipe.recipeId ?? recipe.rcpSeq}
              recipe={{
                ...recipe,
                bookmarked: bookmarkedIds.includes(recipe.recipeId ?? recipe.rcpSeq),
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
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }

        .slide-item {
          flex: 0 0 auto;
          scroll-snap-align: start;
        }

        /* 스크롤바 제거 */
        .no-scrollbar {
          -ms-overflow-style: none; /* IE, Edge */
          scrollbar-width: none; /* Firefox */
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari */
        }
      `}</style>
    </section>
  );
}

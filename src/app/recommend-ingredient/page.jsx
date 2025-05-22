// /app/components/IngredientRecommendationsSection.jsx
'use client';

import { useEffect, useState, useRef } from 'react';
import BookmarkCard from '../../components/BookmarkCard';

export default function IngredientRecommendationsSection({ bookmarkedIds, onBookmark, onUnbookmark }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}api/bookmark/ingredient-recommend`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('접근 권한이 없습니다. 로그인이 필요합니다.');
        }
        throw new Error(`HTTP ${res.status}: 추천 목록을 불러오는 데 실패했습니다.`);
      }
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('서버에서 올바른 JSON 응답을 받지 못했습니다.');
      }
      const data = await res.json();
      setRecipes(data.slice(0, 7));
    } catch (error) {
      console.error('에러:', error);
      setRecipes([]); // 에러 발생 시 빈 배열로 설정
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
                bookmarked: bookmarkedIds.includes(recipe.recipeId ?? recipe.rcpSeq)
              }}
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

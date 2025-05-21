// /app/components/IngredientRecommendationsSection.jsx
'use client';

import { useEffect, useState } from 'react';
import BookmarkCard from '../../components/BookmarkCard';

export default function IngredientRecommendationsSection({ bookmarkedIds, onBookmark, onUnbookmark }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = 1; // 실제 로그인 유저 ID로 바꾸세요

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/bookmark/ingredient-recommend?userId=${userId}`);
        if (!res.ok) throw new Error('추천 목록을 불러오는 데 실패했습니다.');
        const data = await res.json();
        setRecipes(data.slice(0, 7));
      } catch (error) {
        console.error('에러:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId]);

  if (loading) return <p>불러오는 중입니다...</p>;
  if (recipes.length === 0) return null;

  return (
    <section style={{ marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>지금 있는 재료로 만들 수 있는 레시피를 추천해드려요!</h2>
      <div className="scroll-container no-scrollbar">
        {recipes.map((recipe) => (
          <div className="slide-item" key={recipe.rcpSeq}>
            <BookmarkCard
              recipe={{
                ...recipe,
                bookmarked: bookmarkedIds.includes(recipe.recipeId ?? recipe.rcpSeq)
              }}
              userId={userId}
              onBookmark={onBookmark}
              onUnbookmark={onUnbookmark}
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

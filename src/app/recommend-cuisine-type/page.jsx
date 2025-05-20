'use client';

import { useEffect, useState } from 'react';
import BookmarkCard from '../../components/BookmarkCard';

export default function TypeRecommendationsPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = 1; // 실제 로그인 유저 ID로 바꾸세요

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
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

    fetchRecommendations();
  }, []);

  if (loading) return <p>불러오는 중입니다...</p>;
  if (recipes.length === 0) return <p>추천 레시피가 없습니다.</p>;

  return (
    <section style={{ marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>사용자님의 취향 저격 레시피를 모아봤어요!</h2>
      <div className="scroll-container no-scrollbar">
        {recipes.map((recipe) => (
          <div className="slide-item" key={recipe.rcpSeq}>
            <BookmarkCard recipe={recipe} userId={userId} />
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

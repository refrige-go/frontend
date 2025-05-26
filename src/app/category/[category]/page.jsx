'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../../components/layout/Header';
import BottomNavigation from '../../../components/layout/BottomNavigation';
import BookmarkCard from '../../../components/BookmarkCard';

export default function CategoryPage() {
  const { category } = useParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // 실제 API 엔드포인트에 맞게 수정 필요
    fetch(`http://localhost:8080/api/recipe/category/${encodeURIComponent(category)}`)
      .then(res => res.json())
      .then(data => setRecipes(data))
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className='mainContainer'>
      <Header />
      <div className='appContainer'>
        <main style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>{category} 레시피</h2>
          {loading ? (
            <p>불러오는 중...</p>
          ) : recipes.length === 0 ? (
            <p>해당 카테고리의 레시피가 없습니다.</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '20px',
              marginTop: '24px'
            }}>
              {recipes.map((recipe) => (
                <BookmarkCard
                  key={recipe.recipeNm}
                  recipe={{
                    rcpNm: recipe.recipeNm,
                    image: recipe.image,
                  }}
                  userId={1}
                />
              ))}
            </div>
          )}
        </main>
      </div>
      <BottomNavigation />
    </div>
  );
} 
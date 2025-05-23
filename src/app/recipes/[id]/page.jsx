// src/app/recipes/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiUtils } from '../../../lib/api';
import Header from '../../../components/layout/Header';
import BottomNavigation from '../../../components/layout/BottomNavigation';

export default function RecipeDetailPage({ params }) {
  const router = useRouter();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchRecipeDetail(params.id);
    }
    // eslint-disable-next-line
  }, [params.id]);

  const fetchRecipeDetail = async (recipeId) => {
    try {
      setLoading(true);
      const data = await apiUtils.get(`/api/recommendations/recipes/${recipeId}`);
      setRecipe(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('레시피를 찾을 수 없습니다.');
      } else if (err.response?.status === 401) {
        setError('로그인이 필요합니다.');
      } else {
        setError('레시피 정보를 불러올 수 없습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mainContainer">
        <Header />
        <div className="appContainer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <span style={{ fontSize: 18 }}>로딩 중...</span>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="mainContainer">
        <Header />
        <div className="appContainer" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>{error || '레시피를 찾을 수 없습니다'}</h2>
          <button
            onClick={() => router.back()}
            style={{
              padding: '0.8rem 1.5rem',
              background: '#ff6600',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            돌아가기
          </button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // 안전하게 값 접근
  const {
    recipeName,
    description,
    imageUrl,
    ingredients,
    cookingMethod1,
    cookingMethod2,
    cookingMethod3,
    cookingMethod4,
    cookingMethod5,
    cookingMethod6,
  } = recipe;

  const cookingMethods = [
    cookingMethod1,
    cookingMethod2,
    cookingMethod3,
    cookingMethod4,
    cookingMethod5,
    cookingMethod6,
  ].filter(Boolean);

  return (
    <div className="mainContainer">
      <Header />
      <div className="appContainer" style={{ padding: '1rem', maxWidth: 480, margin: '0 auto' }}>
        {/* 이미지 */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img
            src={imageUrl || '/images/default-recipe.jpg'}
            alt={recipeName}
            style={{
              width: '100%',
              maxWidth: 360,
              height: 220,
              objectFit: 'cover',
              borderRadius: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          />
        </div>
        {/* 레시피명 */}
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#ff6600', marginBottom: 8, textAlign: 'center' }}>
          {recipeName}
        </h1>
        {/* 설명 */}
        {description && (
          <p style={{ color: '#666', fontSize: 15, textAlign: 'center', marginBottom: 18 }}>
            {description}
          </p>
        )}
        {/* 재료 */}
        {ingredients && (
          <div style={{
            background: '#f8f9fa',
            padding: '1rem',
            borderRadius: 12,
            marginBottom: 18
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: '#333' }}>🥘 필요한 재료</h3>
            <p style={{ fontSize: 14, color: '#666', margin: 0 }}>{ingredients}</p>
          </div>
        )}
        {/* 조리법 */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, color: '#333' }}>👨‍🍳 조리법</h3>
          {cookingMethods.length > 0 ? (
            cookingMethods.map((method, idx) => (
              <div key={idx} style={{
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                padding: '1rem',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12
              }}>
                <span style={{
                  background: '#ff6600',
                  color: 'white',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: 2
                }}>
                  {idx + 1}
                </span>
                <span style={{ fontSize: 14, color: '#333', lineHeight: 1.6 }}>{method}</span>
              </div>
            ))
          ) : (
            <p style={{ color: '#999', fontSize: 14 }}>조리법 정보가 없습니다.</p>
          )}
        </div>
        {/* 돌아가기 버튼 */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button
            onClick={() => router.back()}
            style={{
              padding: '0.8rem 1.5rem',
              background: '#ff6600',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            돌아가기
          </button>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
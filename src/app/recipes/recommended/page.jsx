'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigation from '../../../components/layout/BottomNavigation';

export default function RecommendedRecipesPage() {
  const router = useRouter();
  const [recommendationData, setRecommendationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedData = sessionStorage.getItem('recommendedRecipes');
    
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        console.log('저장된 추천 데이터:', data);
        setRecommendationData(data);
      } catch (error) {
        console.error('추천 데이터 파싱 실패:', error);
        router.push('/refrigerator');
      }
    } else {
      router.push('/refrigerator');
    }
    
    setLoading(false);
  }, [router]);

  const handleRecipeClick = (recipeId) => {
    console.log('레시피 클릭:', recipeId);
    router.push(`/recipe-detail/${recipeId}`);
  };

  const handleBackToRefrigerator = () => {
    sessionStorage.removeItem('recommendedRecipes');
    router.push('/refrigerator');
  };

  if (loading) {
    return (
      <div className="mainContainer">
        {/* 상단 네비게이션 바 */}
        <div style={{
          width: '420px',
          height: '70px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px 0 20px',
          boxSizing: 'border-box',
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <button 
            onClick={handleBackToRefrigerator}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            margin: 0
          }}>
            추천 레시피
          </h2>
          <div style={{ width: '18px' }}></div> {/* 균형을 위한 빈 공간 */}
        </div>

        <div className="appContainer">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh',
            fontSize: '18px',
            marginTop: '70px'
          }}>
            로딩 중...
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!recommendationData || !recommendationData.recommendedRecipes) {
    return (
      <div className="mainContainer">
        {/* 상단 네비게이션 바 */}
        <div style={{
          width: '420px',
          height: '70px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px 0 20px',
          boxSizing: 'border-box',
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <button 
            onClick={handleBackToRefrigerator}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            margin: 0
          }}>
            추천 레시피
          </h2>
          <div style={{ width: '18px' }}></div> {/* 균형을 위한 빈 공간 */}
        </div>

        <div className="appContainer">
          <div style={{ padding: '2rem', textAlign: 'center', marginTop: '70px' }}>
            <h2>추천 결과를 찾을 수 없습니다</h2>
            <button 
              onClick={handleBackToRefrigerator}
              style={{
                padding: '0.8rem 1.5rem',
                background: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              냉장고로 돌아가기
            </button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // 백엔드 RecipeRecommendationResponseDto 구조에 맞게 데이터 추출
  const { recommendedRecipes, totalCount, selectedIngredients } = recommendationData;

  return (
    <div className="mainContainer">
      {/* 상단 네비게이션 바 */}
      <div style={{
        width: '420px',
        height: '70px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px 0 20px',
        boxSizing: 'border-box',
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <button 
          onClick={handleBackToRefrigerator}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          ←
        </button>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          margin: 0
        }}>
          추천 레시피 ({totalCount}개)
        </h2>
        <div style={{ width: '18px' }}></div> {/* 균형을 위한 빈 공간 */}
      </div>

      <div className="appContainer" style={{ paddingTop: '70px' }}>
        
        {/* 선택한 재료 정보 박스 */}
        <div style={{
          background: '#fff6ee',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid #ffd6b8',
          margin: '1rem 0'
        }}>
          <p style={{ 
            fontSize: '14px', 
            color: '#f97316',
            margin: 0,
            fontWeight: '500'
          }}>
            선택한 재료: {selectedIngredients.join(', ')}
          </p>
        </div>

        {/* 레시피 목록 - 이미지 포함 */}
        {recommendedRecipes.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
            {recommendedRecipes.map((recipe) => (
              <div
                key={recipe.recipeId}
                onClick={() => handleRecipeClick(recipe.recipeId)}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  display: 'flex',
                  gap: '1rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                {/* 레시피 이미지 */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: '#f5f5f5'
                }}>
                  <img 
                    src={recipe.imageUrl || '/images/default.jpg'} 
                    alt={recipe.recipeName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = '/images/default.jpg';
                    }}
                  />
                </div>

                {/* 레시피 정보 */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: '#333',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {recipe.recipeName}
                  </h3>
                  
                  <div style={{ marginBottom: '0.8rem' }}>
                    <span style={{
                      background: '#f97316',
                      color: 'white',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      marginRight: '0.5rem'
                    }}>
                      매칭 {recipe.matchedIngredientCount}개
                    </span>
                    <span style={{
                      background: '#f0f0f0',
                      color: '#666',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '20px',
                      fontSize: '12px'
                    }}>
                      점수: {Math.round(recipe.matchScore * 100)}%
                    </span>
                  </div>

                  {recipe.matchedIngredients && recipe.matchedIngredients.length > 0 && (
                    <div style={{ marginBottom: '0.8rem' }}>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#666', 
                        margin: '0 0 0.3rem 0',
                        fontWeight: '500'
                      }}>
                        매칭 재료:
                      </p>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#f97316',
                        margin: 0,
                        fontWeight: '500'
                      }}>
                        {recipe.matchedIngredients.join(', ')}
                      </p>
                    </div>
                  )}

                  {recipe.ingredients && (
                    <p style={{ 
                      fontSize: '13px', 
                      color: '#999', 
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      전체 재료: {recipe.ingredients}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 1rem',
            color: '#666'
          }}>
            <h3>선택한 재료로 만들 수 있는 레시피가 없습니다</h3>
            <p style={{ marginBottom: '1.5rem' }}>다른 재료를 선택해보세요</p>
            <button 
              onClick={handleBackToRefrigerator}
              style={{
                padding: '0.8rem 1.5rem',
                background: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              냉장고로 돌아가기
            </button>
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}
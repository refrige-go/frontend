'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigation from '../../../components/layout/BottomNavigation';
import SubPageHeader from '../../../components/layout/SubPageHeader';

export default function RecommendedRecipesPage() {
  const router = useRouter();
  const [recommendationData, setRecommendationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 스마트 추천 데이터 우선 조회, 없으면 기본 추천 데이터 조회
    const smartData = sessionStorage.getItem('smartRecommendedRecipes');
    const basicData = sessionStorage.getItem('recommendedRecipes');
    const storedData = smartData || basicData;
    
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
    sessionStorage.removeItem('smartRecommendedRecipes');
    router.push('/refrigerator');
  };

  if (loading) {
    return (
      <div className="mainContainer">
        <SubPageHeader title="추천 레시피" onBack={handleBackToRefrigerator} />

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
        <SubPageHeader title="추천 레시피" onBack={handleBackToRefrigerator} />

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
      <SubPageHeader title="추천 레시피" onBack={handleBackToRefrigerator} />

      <div className="appContainer" style={{ paddingTop: '70px', paddingBottom: '80px' }}>
        
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
                  width: '100px',
                  height: '100px',
                  borderRadius: '12px',
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
                  
                  {/* 제목 */}
                  <div style={{
                    marginBottom: '0.75rem'
                  }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: 'bold', 
                      color: '#333',
                      margin: 0,
                      lineHeight: '1.3',
                      wordBreak: 'keep-all'
                    }}>
                      {recipe.recipeName}
                    </h3>
                  </div>

                  {/* 상태 배지들 - 한 줄로 배치 */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    alignItems: 'center'
                  }}>
                    {/* 매칭 정보 배지 */}
                    <span style={{
                      background: '#f97316',
                      color: 'white',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '15px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      매칭 {recipe.matchedIngredientCount}개
                    </span>
                    
                    <span style={{
                      background: '#f0f0f0',
                      color: '#666',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '15px',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}>
                      {Math.round(recipe.matchScore * 100)}%
                    </span>

                    {/* 상태 배지 */}
                    {recipe.matchStatus === 'PERFECT' && (
                      <span style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '15px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        ✅ 완벽매칭
                      </span>
                    )}
                    {recipe.matchStatus === 'MISSING_1' && (
                      <span style={{
                        background: '#f59e0b',
                        color: 'white',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '15px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        🛒 1개부족
                      </span>
                    )}
                    {recipe.matchStatus === 'MISSING_2' && (
                      <span style={{
                        background: '#f59e0b',
                        color: 'white',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '15px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        🛒 2개부족
                      </span>
                    )}
                    
                    {/* 긴급 재료 배지 */}
                    {recipe.urgentIngredients && recipe.urgentIngredients.length > 0 && (
                      <span style={{
                        background: '#ef4444',
                        color: 'white',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '15px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        ⚠️ 곧만료
                      </span>
                    )}
                  </div>

                  {/* 매칭된 재료 표시 */}
                  {recipe.matchedIngredients && recipe.matchedIngredients.length > 0 && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.4rem'
                      }}>
                        {recipe.matchedIngredients.slice(0, 4).map((ingredient, index) => {
                          const isUrgent = recipe.urgentIngredients?.includes(ingredient);
                          return (
                            <span key={index} style={{
                              background: isUrgent ? '#fee2e2' : '#fff7ed',
                              color: isUrgent ? '#dc2626' : '#f97316',
                              border: isUrgent ? '1px solid #fca5a5' : '1px solid #fed7aa',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}>
                              {isUrgent && '⚠️'}
                              {ingredient}
                            </span>
                          );
                        })}
                        {recipe.matchedIngredients.length > 4 && (
                          <span style={{
                            background: '#f3f4f6',
                            color: '#6b7280',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            +{recipe.matchedIngredients.length - 4}개
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 추천 이유 또는 부족한 재료 정보 */}
                  {(() => {
                    // 부족한 재료 정보가 있고 비어있지 않으면 우선 표시
                    if (recipe.missingIngredients && 
                        recipe.missingIngredients !== null &&
                        ((Array.isArray(recipe.missingIngredients) && recipe.missingIngredients.length > 0) ||
                         (!Array.isArray(recipe.missingIngredients) && recipe.missingIngredients.trim() !== ''))) {
                      const missingText = Array.isArray(recipe.missingIngredients) 
                        ? recipe.missingIngredients.join(', ') 
                        : recipe.missingIngredients;
                        
                      return (
                        <div style={{
                          background: '#fef3c7',
                          border: '1px solid #fcd34d',
                          borderRadius: '8px',
                          padding: '0.6rem',
                          marginBottom: '0.75rem'
                        }}>
                          <p style={{ 
                            fontSize: '12px', 
                            color: '#d97706',
                            margin: 0,
                            fontWeight: '600'
                          }}>
                            💡 {missingText}만 더 있으면 완성!
                          </p>
                        </div>
                      );
                    }
                    
                    return null;
                  })()}

                  {/* 추가 정보 */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid #f3f4f6'
                  }}>
                    <span style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      fontWeight: '500'
                    }}>
                      전체 재료 {recipe.ingredients ? recipe.ingredients.split(',').length : 0}개
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      fontWeight: '500'
                    }}>
                      상세보기 &gt;
                    </span>
                  </div>
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

'use client';

import { useState } from 'react';
import Link from 'next/link';
import axiosInstance from '../api/axiosInstance';

export default function SearchRecipeCard({ recipe, showScore = true }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 검색 결과 데이터 구조에 맞춰 필드 매핑
  const recipeId = recipe.rcpSeq;
  const recipeName = recipe.rcpNm;
  const recipeCategory = recipe.rcpCategory;
  const cookingMethod = recipe.rcpWay2;
  const ingredients = recipe.ingredients || [];
  const score = recipe.score;
  const matchReason = recipe.matchReason;

  const handleToggleBookmark = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    const previousState = isBookmarked;
    setIsBookmarked(!previousState);

    try {
      await axiosInstance.post(`api/bookmark/toggle`, null, {
        params: { recipeId }
      });
    } catch (err) {
      console.error('찜 토글 실패:', err);
      setIsBookmarked(previousState);
      alert('찜 기능에 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 재료 텍스트 생성 (AI 서버 응답 구조에 맞춤)
  const getIngredientsText = () => {
    if (Array.isArray(ingredients) && ingredients.length > 0) {
      return ingredients.map(ing => ing.name || ing).join(', ');
    }
    return '재료 정보가 없습니다.';
  };

  return (
    <div style={cardStyle}>
      <Link href={`/recipe-detail/${recipeId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={cardContentStyle}>
          
          {/* 레시피 이미지 영역 */}
          <div style={imageWrapperStyle}>
            {(recipe.image || recipe.thumbnail) ? (
              <img 
                src={recipe.thumbnail || recipe.image} 
                alt={recipeName}
                style={recipeImageStyle}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const placeholder = e.target.nextSibling;
                  if (placeholder) {
                    placeholder.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div style={{...placeholderImageStyle, display: (recipe.image || recipe.thumbnail) ? 'none' : 'flex'}}>
              🍳
            </div>
            <button
              style={{
                ...heartButtonStyle,
                color: isBookmarked ? '#ff6b6b' : '#ddd'
              }}
              onClick={handleToggleBookmark}
              disabled={isLoading}
              aria-label="찜 버튼"
            >
              {isBookmarked ? '❤️' : '🤍'}
            </button>
          </div>

          {/* 레시피 정보 영역 */}
          <div style={contentStyle}>
            <h3 style={titleStyle}>{recipeName || '레시피명 없음'}</h3>
            
            <div style={metaInfoStyle}>
              {recipeCategory && (
                <span style={tagStyle}>{recipeCategory}</span>
              )}
              {cookingMethod && (
                <span style={tagStyle}>{cookingMethod}</span>
              )}
            </div>

            <p style={ingredientsStyle}>
              <strong>재료:</strong> {getIngredientsText()}
            </p>

            {/* 검색 점수 표시 (옵션) */}
            {showScore && score && (
              <div style={scoreStyle}>
                <span>관련도: {score.toFixed(1)}%</span>
                {matchReason && (
                  <span style={reasonStyle}>{matchReason}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

// 스타일 정의
const cardStyle = {
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  transition: 'transform 0.2s, box-shadow 0.2s',
  cursor: 'pointer',
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
  }
};

const cardContentStyle = {
  position: 'relative'
};

const imageWrapperStyle = {
  position: 'relative',
  width: '100%',
  height: '200px',
  backgroundColor: '#f8f9fa',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden'
};

const recipeImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block'
};

const placeholderImageStyle = {
  fontSize: '48px',
  color: '#6c757d',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%'
};

const heartButtonStyle = {
  position: 'absolute',
  top: '12px',
  right: '12px',
  background: 'rgba(255, 255, 255, 0.9)',
  border: 'none',
  borderRadius: '50%',
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontSize: '18px',
  transition: 'background 0.2s',
  zIndex: 1
};

const contentStyle = {
  padding: '16px'
};

const titleStyle = {
  margin: '0 0 8px 0',
  fontSize: '18px',
  fontWeight: '600',
  color: '#212529',
  lineHeight: '1.4'
};

const metaInfoStyle = {
  display: 'flex',
  gap: '8px',
  marginBottom: '12px',
  flexWrap: 'wrap'
};

const tagStyle = {
  backgroundColor: '#e9ecef',
  color: '#495057',
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '500'
};

const ingredientsStyle = {
  margin: '0 0 8px 0',
  fontSize: '14px',
  color: '#6c757d',
  lineHeight: '1.4',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden'
};

const scoreStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '12px',
  color: '#28a745',
  fontWeight: '500',
  marginTop: '8px',
  paddingTop: '8px',
  borderTop: '1px solid #dee2e6'
};

const reasonStyle = {
  color: '#6c757d',
  fontSize: '11px'
};

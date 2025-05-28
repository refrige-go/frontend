'use client';

import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import Link from 'next/link';

export default function RecipeCard({ recipe, onUnbookmark }) {
  const recipeId = recipe.recipeId ?? recipe.rcpSeq;
  const [isBookmarked, setIsBookmarked] = useState(recipe.bookmarked);

  const handleToggleBookmark = async () => {
    const previousState = isBookmarked;
    setIsBookmarked(!previousState); // 1. Optimistic UI: 하트 먼저 토글

    try {
      const response = await axiosInstance.post(`api/bookmark/toggle`, null, {
        params: { recipeId }
      });

      // 2. 서버 응답에 따라 찜 해제된 경우만 onUnbookmark 콜백 실행
      if (!response.data.bookmarked) {
        onUnbookmark?.(recipeId); // 3. 성공 후 카드 제거
      }
    } catch (err) {
      console.error('찜 토글 실패:', err);
      setIsBookmarked(previousState); // 4. 실패 시 원래대로 복구
    }
  };

  return (
    <Link href={`/recipe-detail/${recipe.recipeId ?? recipe.rcpSeq}`}>

      <div className="card">
        <div className="image-wrapper">
          <img
            src={recipe.image}
            alt={recipe.rcpNm || '레시피 이미지'}
            className="recipe-img"
          />
          <button
            className="heart"
            onClick={(e) => {
              e.stopPropagation(); // 이벤트 버블링 방지
              e.preventDefault(); // 링크 이동 방지
              handleToggleBookmark();
            }}
            aria-label="찜 버튼"
          >
            {isBookmarked ? '🧡' : '🤍'}
          </button>

        </div>

        <div className="content">
          <div className="title">{recipe.rcpNm}</div>
          <div className="ingredient" title={recipe.rcpPartsDtls}>
            {'재료: ' + recipe.rcpPartsDtls || '재료 정보가 없습니다.'}
          </div>
          <div className="type">{'요리 타입: ' + recipe.cuisineType || '요리 타입 정보가 없습니다.'}</div>
          <div className="way">{'조리 방법 : ' + recipe.rcpWay2 || '조리 방법 정보가 없습니다.'}</div>
        </div>

        <style jsx>{`
        .card {
          display: flex;
          width: 360px;
          border-radius: 20px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          padding: 12px;
          background: white;
          overflow: hidden;
          gap: 12px;
        }

        .image-wrapper {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 15px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .recipe-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 15px;
        }

        .heart {
          position: absolute;
          top: 8px;
          right: 8px;
          background: white;
          border-radius: 50%;
          border: none;
          padding: 4px;
          font-size: 16px;
          cursor: pointer;
          z-index: 2;
        }

        .content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          overflow: hidden;
        }

        .title {
          font-weight: bold;
          font-size: 1rem;
          margin-bottom: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ingredient {
          font-size: 0.8rem;
          color: #555;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          white-space: normal;
          margin-bottom: 6px;
          max-height: calc(1.2em * 3);
          line-height: 1.2em;
        }

        .type,
        .way {
          font-size: 0.75rem;
          color: #777;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }
      `}</style>
      </div>
    </Link>
  );
}

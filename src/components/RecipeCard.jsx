'use client';

import { useState } from 'react';
import axios from 'axios';

export default function RecipeCard({ token, recipe, userId, onBookmark, onUnbookmark }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

  const handleToggleBookmark = async () => {
    try {
      const response = await axios.post(`${baseUrl}api/bookmark/toggle`, null, {
        params: {
          recipeId: recipe.recipeId ?? recipe.rcpSeq
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.data.bookmarked) {
        onUnbookmark && onUnbookmark(recipe.recipeId ?? recipe.rcpSeq);
      }
    } catch (err) {
      console.error('찜 토글 실패:', err);
    }
  };

  return (
    <div className="card">
      <div className="image-wrapper">
        <img src={recipe.image} alt={recipe.rcpNm} className="recipe-img" />
        <button className="heart" onClick={handleToggleBookmark}>
          {recipe.bookmarked ? '🧡' : '🤍'}
        </button>
      </div>

      <div className="content">
        <div className="title">{recipe.rcpNm}</div>
        <div className="ingredient" title={recipe.rcpPartsDtls}>{recipe.rcpPartsDtls || '재료 정보가 없습니다.'}</div>
        <div className="type">{recipe.cuisineType || '요리 타입 정보가 없습니다.'}</div>
        <div className="way">{recipe.rcpWay2 || '조리 방법 정보가 없습니다.'}</div>
      </div>

      <style jsx>{`
        .card {
          display: flex;
          width: 360px; /* 넓게 설정 */
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
          flex-shrink: 0; /* 이미지 크기 고정 */
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
          /* flex-grow: 1;  <-- 이거 제거 */
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3; /* 최대 3줄까지 보임 */
          -webkit-box-orient: vertical;
          white-space: normal;
          margin-bottom: 6px;
          max-height: calc(1.2em * 3); /* 줄 높이 1.2em 기준, 3줄까지만 */
          line-height: 1.2em;
        }


        .type, .way {
          font-size: 0.75rem;
          color: #777;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
}

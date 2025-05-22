'use client';

import { useState } from 'react';
import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

export default function BookmarkCard({ recipe, onBookmark, onUnbookmark }) {
  const handleToggleBookmark = async () => {
    try {
      const token = localStorage.getItem('token'); // 로그인 시 저장해둔 토큰
      const userId = localStorage.getItem('userId'); // 여기서 직접 받아옴

      const response = await axios.post(
        `${baseUrl}api/bookmark/toggle`,
        null,
        {
          params: {
            userId,
            recipeId: recipe.recipeId ?? recipe.rcpSeq
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.bookmarked) {
        onBookmark && onBookmark(recipe.recipeId ?? recipe.rcpSeq);
      } else {
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
      <div className="title">{recipe.rcpNm}</div>

      <style jsx>{`
        .card {
          width: 160px;
          height: 150px;
          border-radius: 20px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          padding: 10px;
          text-align: center;
          background: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
        }

        .image-wrapper {
          position: relative;
          width: 100%;
          height: 120px;
          overflow: hidden;
          border-radius: 15px;
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
        }

        .title {
          margin-top: 8px;
          font-weight: bold;
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}

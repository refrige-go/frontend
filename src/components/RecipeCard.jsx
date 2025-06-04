'use client';

import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import Link from 'next/link';
import styles from '../styles/RecipeCard.module.css'

export default function RecipeCard({ recipe, onUnbookmark }) {
  const recipeId = recipe.recipeId ?? recipe.rcpSeq;
  const [isBookmarked, setIsBookmarked] = useState(recipe.bookmarked);

  const handleToggleBookmark = async () => {
    const previousState = isBookmarked;
    setIsBookmarked(!previousState);

    try {
      const response = await axiosInstance.post(`api/bookmark/toggle`, null, {
        params: { recipeId }
      });

      if (!response.data.bookmarked) {
        onUnbookmark?.(recipeId);
      }
    } catch (err) {
      console.error('찜 토글 실패:', err);
      setIsBookmarked(previousState);
    }
  };

  return (
    <Link href={`/recipe-detail/${recipe.recipeId ?? recipe.rcpSeq}`}>

      <div className={styles.card}>
        <div className={styles['image-wrapper']}>
          <img
            src={recipe.image}
            alt={recipe.rcpNm || '레시피 이미지'}
            className={styles['recipe-img']}
          />
          <button
            className={styles.heart}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleToggleBookmark();
            }}
            aria-label="찜 버튼"
          >
            {isBookmarked ? '🧡' : '🤍'}
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.title}>{recipe.rcpNm}</div>
          <div className={styles.ingredient} title={recipe.rcpPartsDtls}>
            {'재료: ' + recipe.rcpPartsDtls || '재료 정보가 없습니다.'}
          </div>
          <div className={styles.type}>{'요리 타입: ' + recipe.cuisineType || '요리 타입 정보가 없습니다.'}</div>
          <div className={styles.way}>{'조리 방법 : ' + recipe.rcpWay2 || '조리 방법 정보가 없습니다.'}</div>
        </div>
      </div>

    </Link>
  );
}

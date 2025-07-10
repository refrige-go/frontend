'use client';

import Link from 'next/link';
import axiosInstance from '../api/axiosInstance';
import styles from '../styles/BookmarkCard.module.css';

export default function BookmarkCard({ recipe, onUnbookmark, onBookmark }) {
  const recipeId = recipe.recipeId ?? recipe.rcpSeq;

  const handleToggleBookmark = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      const response = await axiosInstance.post('/api/bookmark/toggle', null, {
        params: {
          recipeId: recipeId,
        },
      });

      const { bookmarked } = response.data;

      if (bookmarked) {
        onBookmark && onBookmark(recipeId);
      } else {
        onUnbookmark && onUnbookmark(recipeId);
      }

    } catch (err) {
      console.error('찜 토글 실패:', err);
    }
  };

  return (
    <Link href={`/recipe-detail/${recipe.recipeId ?? recipe.rcpSeq}`}>
      <div className={styles.card}>
        <div className={styles.imageWrapper}>
          <img 
            src={recipe.image || '/images/default.jpg'} 
            alt={recipe.rcpNm} 
            className={styles.recipeImg} 
            onError={(e) => {
              e.target.src = '/images/default.jpg';
            }}
          />
          <button className={styles.heart} onClick={handleToggleBookmark}>
            {recipe.bookmarked ? '🧡' : '🤍'}
          </button>
        </div>
        <div className={styles.title}>{recipe.rcpNm}</div>
      </div>
    </Link>
  );
}

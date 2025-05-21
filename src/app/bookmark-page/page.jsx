// src/app/bookmark-page/page.jsx
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import BookmarkCard from '../../components/BookmarkCard';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import IngredientRecommendationsSection from '../recommend-ingredient/page';
import styles from '../../styles/pages/bookmark.module.css';

export default function BookmarksPage() {
  const [recipes, setRecipes] = useState([]);
  const [activeTab, setActiveTab] = useState('전체');
  const [ingredientRecipes, setIngredientRecipes] = useState([]);
  const userId = 1;

  // 기존 찜 레시피
  useEffect(() => {
    if (activeTab === '전체') {
      axios.get(`http://localhost:8080/api/bookmark/${userId}`)
        .then((res) => setRecipes(res.data))
        .catch((err) => console.error('찜한 레시피 가져오기 실패:', err));
    }
  }, [activeTab, userId]);

  // "지금 가능" 레시피 불러오기
  const fetchIngredientRecipes = async () => {
    const res = await fetch(`http://localhost:8080/api/bookmark/ingredient-recommend?userId=${userId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data;
  };

  // "지금 가능" 탭 클릭 시 레시피 불러오기
  useEffect(() => {
    if (activeTab === '지금 가능') {
      fetchIngredientRecipes().then(setIngredientRecipes);
    }
  }, [activeTab]);

  return (
    <div className='mainContainer'>
      <Header />
      <div className='appContainer'>
        <div className={styles.pageContainer}>
          <div className={styles.contentWrapper}>
            {/* 상단 타이틀 섹션 */}
            <div className={styles.titleSection}>
              <h1>내 레시피북</h1>
              <p>즐겨찾는 레시피를 모아보세요!</p>
              <p className={styles.recipeCount}>총 {recipes.length}개의 레시피가 저장되었어요</p>
            </div>

            {/* 탭 메뉴 */}
            <div className={styles.tabContainer}>
              {['전체', '지금 가능', '자주 만듦'].map((tab) => (
                <button
                  key={tab}
                  className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* 레시피 그리드 */}
            <div className={styles.recipeGrid}>
              {activeTab === '전체' &&
                recipes.map(recipe => (
                  <BookmarkCard
                    key={recipe.recipeId}
                    recipe={recipe}
                    userId={userId}
                    onUnbookmark={(id) => {
                      setRecipes((prev) => prev.filter((r) => (r.recipeId ?? r.rcpSeq) !== id));
                      setIngredientRecipes((prev) => prev.filter((r) => (r.recipeId ?? r.rcpSeq) !== id));
                    }}
                  />
                ))
              }
              {activeTab === '지금 가능' &&
                ingredientRecipes.map(recipe => {
                  const isBookmarked = recipes.some(
                    r => (r.recipeId ?? r.rcpSeq) === (recipe.recipeId ?? recipe.rcpSeq)
                  );
                  return (
                    <BookmarkCard
                      key={recipe.recipeId ?? recipe.rcpSeq}
                      recipe={{ ...recipe, bookmarked: isBookmarked }}
                      userId={userId}
                      onUnbookmark={(id) => {
                        setRecipes((prev) => prev.filter((r) => (r.recipeId ?? r.rcpSeq) !== id));
                        setIngredientRecipes((prev) => prev.filter((r) => (r.recipeId ?? r.rcpSeq) !== id));
                      }}
                    />
                  );
                })
              }
              {/* "자주 만듦" 등 다른 탭도 필요시 추가 */}
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
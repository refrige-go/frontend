'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import BookmarkCard from '../../components/BookmarkCard';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import styles from '../../styles/pages/bookmark.module.css';

export default function BookmarksPage() {
  const [userId, setUserId] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [activeTab, setActiveTab] = useState('전체');
  const [ingredientRecipes, setIngredientRecipes] = useState([]);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;


  // ✅ 유저 정보 불러오기
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('유저 정보 가져오기 실패');
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  useEffect(() => {
    fetchUserInfo().then(user => {
      if (user) setUserId(user.id);
    });
  }, []);

  // ✅ 기존 찜 레시피 불러오기
  useEffect(() => {
    if (activeTab === '전체' && userId) {
      axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}api/bookmark/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((res) => setRecipes(res.data))
        .catch((err) => console.error('찜한 레시피 가져오기 실패:', err));
    }
  }, [activeTab, userId]);

  // ✅ "지금 가능" 탭 레시피 불러오기
  useEffect(() => {
    if (activeTab === '지금 가능' && userId) {
      fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}api/bookmark/ingredient-recommend?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((res) => res.json())
        .then(setIngredientRecipes)
        .catch(err => console.error('가능한 레시피 가져오기 실패:', err));
    }
  }, [activeTab, userId]);

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
              <p className={styles.recipeCount}>
                총 {(activeTab === '전체' ? recipes.length : ingredientRecipes.length)}개의 레시피가 저장되었어요
              </p>
            </div>

            {/* 탭 메뉴 */}
            <div className={styles.tabContainer}>
              {['전체', '지금 가능'].map((tab) => (
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
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}

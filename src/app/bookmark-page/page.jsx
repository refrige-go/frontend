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
  const [userId, setUserId] = useState(null);
  const baseURL = process.env.NEXT_PUBLIC_BASE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.userId || payload.id || payload.sub || null);
    } catch {
      setUserId(null);
    }
  }, []);

  // 기존 찜 레시피
  useEffect(() => {
    if (!userId) return;
    if (activeTab === '전체') {
      const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
      axios.get(`${baseURL}/api/bookmark/${userId}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'Content-Type': 'application/json',
        }
      })
        .then((res) => {
          console.log('북마크 데이터:', res.data);
          setRecipes(res.data);
        })
        .catch((err) => {
          console.error('찜한 레시피 가져오기 실패:', {
            status: err.response?.status,
            data: err.response?.data,
            message: err.message
          });
          setRecipes([]);
        });
    }
  }, [activeTab, userId, baseURL]);

  // "지금 가능" 레시피 불러오기
  const fetchIngredientRecipes = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
      const response = await fetch(`${baseURL}/api/bookmark/ingredient-recommend?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('지금 가능 레시피 데이터:', data);
      return data;
    } catch (error) {
      console.error('지금 가능 레시피 가져오기 실패:', error);
      throw error;
    }
  };

  // "지금 가능" 탭 클릭 시 레시피 불러오기
  useEffect(() => {
    if (!userId) return;
    if (activeTab === '지금 가능') {
      fetchIngredientRecipes()
        .then(setIngredientRecipes)
        .catch((err) => {
          console.error('지금 가능 레시피 가져오기 실패:', err);
          setIngredientRecipes([]);
        });
    }
  }, [activeTab, baseURL, userId]);

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
                    key={recipe.recipeId ?? recipe.rcpSeq}
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
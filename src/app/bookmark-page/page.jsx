'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '../../api/axiosInstance';
import BookmarkCard from '../../components/BookmarkCard';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import styles from '../../styles/pages/bookmark.module.css';

export default function BookmarksPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [ingredientRecipes, setIngredientRecipes] = useState([]);
  const [activeTab, setActiveTab] = useState('전체');
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
    }
    if (!storedToken) {
      alert("로그인 후 이용 가능합니다.");
      router.replace("/login");
      return;
    }
    axiosInstance.get("/secure/ping")
      .catch(() => {
        alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
        localStorage.removeItem('accessToken');
        router.replace("/login");
      });
  }, [router]);

  useEffect(() => {
    const fetchBookmarkedRecipes = async () => {
      if (!token) return;

      try {
        const response = await axiosInstance.get('/api/bookmark/list', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRecipes(response.data);
      } catch (err) {
        console.error('찜한 레시피 가져오기 실패:', err);
      }
    };

    if (activeTab === '전체' && token) {
      fetchBookmarkedRecipes();
    }
  }, [activeTab, token]);

  useEffect(() => {
    const fetchIngredientRecipes = async () => {
      if (!token) return;

      try {
        const response = await axiosInstance.get('/api/bookmark/ingredient-recommend', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setIngredientRecipes(response.data);
      } catch (err) {
        console.error('가능한 레시피 가져오기 실패:', err);
      }
    };

    if (activeTab === '지금 가능' && token) {
      fetchIngredientRecipes();
    }
  }, [activeTab, token]);

  return (
    <div className='mainContainer'>
      <Header />
      <div className='appContainer'>
        <div className={styles.pageContainer}>
          <div className={styles.contentWrapper}>
            <div className={styles.titleSection}>
              <h1>내 레시피북</h1>
              <p>즐겨찾는 레시피를 모아보세요!</p>
              <p className={styles.recipeCount}>
                총 {(activeTab === '전체' ? recipes.length : ingredientRecipes.length)}개의 레시피가 저장되었어요
              </p>
            </div>

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

            <div className={styles.recipeGrid}>
              {activeTab === '전체' &&
                recipes.map(recipe => (
                  <BookmarkCard
                    key={recipe.recipeId ?? recipe.rcpSeq}
                    recipe={recipe}
                    onUnbookmark={(id) => {
                      setRecipes(prev => prev.filter(r => (r.recipeId ?? r.rcpSeq) !== id));
                      setIngredientRecipes(prev => prev.filter(r => (r.recipeId ?? r.rcpSeq) !== id));
                    }}
                  />
                ))}

              {activeTab === '지금 가능' &&
                ingredientRecipes.map(recipe => {
                  const isBookmarked = recipes.some(
                    r => (r.recipeId ?? r.rcpSeq) === (recipe.recipeId ?? recipe.rcpSeq)
                  );
                  return (
                    <BookmarkCard
                      key={recipe.recipeId ?? recipe.rcpSeq}
                      recipe={{ ...recipe, bookmarked: isBookmarked }}
                      token={token}
                      onUnbookmark={(id) => {
                        setRecipes(prev => prev.filter(r => (r.recipeId ?? r.rcpSeq) !== id));
                        setIngredientRecipes(prev => prev.filter(r => (r.recipeId ?? r.rcpSeq) !== id));
                      }}
                    />
                  );
                })}
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}

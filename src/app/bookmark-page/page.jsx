'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '../../api/axiosInstance';
import BookmarkCard from '../../components/BookmarkCard';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import styles from '../../styles/pages/bookmark.module.css';

function getPayloadFromToken(token) {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function BookmarksPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [ingredientRecipes, setIngredientRecipes] = useState([]);
  const [activeTab, setActiveTab] = useState('전체');
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (accessToken) {
      setToken(accessToken);
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        if (payload && payload.id) {
          setUserId(payload.id);
        } else if (payload && payload.username) {
          setUserId(payload.username);
        } else if (payload && payload.userId) {
          setUserId(payload.userId);
        } else if (payload && payload.sub) {
          setUserId(payload.sub);
        } else {
          setUserId(null);
        }
      } catch (e) {
        setUserId(null);
      }
    } else {
      setToken('');
      setUserId(null);
    }
  }, []);

  useEffect(() => {
    if (token === null) return;
    if (!token) {
      alert("로그인 후 이용 가능합니다.");
      router.replace("/login");
      return;
    }
    axiosInstance.get("/secure/ping", {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {
      alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
      localStorage.removeItem('accessToken');
      router.replace("/login");
    });
  }, [router, token]);

  useEffect(() => {
    if (token === null || !userId) return;
    if (activeTab !== '전체') return;
    const fetchBookmarkedRecipes = async () => {
      try {
        const latestToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const latestPayload = getPayloadFromToken(latestToken);
        const latestUserId = latestPayload?.id || latestPayload?.userId || latestPayload?.username || latestPayload?.sub;
        if (!latestUserId) return;
        const res = await axiosInstance.get(`/api/bookmark/list?userId=${latestUserId}`, {
          headers: { Authorization: `Bearer ${latestToken}` },
        });
        setRecipes(res.data);
      } catch (err) {
        console.error('찜한 레시피 가져오기 실패:', err);
      }
    };
    fetchBookmarkedRecipes();
  }, [activeTab, token, userId]);

  useEffect(() => {
    if (token === null || !userId) return;
    if (activeTab !== '지금 가능') return;
    const fetchIngredientRecipes = async () => {
      try {
        const latestToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const latestPayload = getPayloadFromToken(latestToken);
        const latestUserId = latestPayload?.id || latestPayload?.userId || latestPayload?.username || latestPayload?.sub;
        if (!latestUserId) return;
        const res = await axiosInstance.get(`/api/bookmark/ingredient-recommend?userId=${latestUserId}`, {
          headers: { Authorization: `Bearer ${latestToken}` },
        });
        setIngredientRecipes(res.data);
      } catch (err) {
        console.error('가능한 레시피 가져오기 실패:', err);
      }
    };
    fetchIngredientRecipes();
  }, [activeTab, token, userId]);

  if (token === null) {
    return <div>로딩 중...</div>;
  }

  const handleUnbookmark = (id) => {
    setRecipes(prev => prev.filter(r => (r.recipeId ?? r.rcpSeq) !== id));
    setIngredientRecipes(prev => prev.filter(r => (r.recipeId ?? r.rcpSeq) !== id));
  };

  const recipeList = activeTab === '전체' ? recipes : ingredientRecipes;

  if (userId === null) {
    // 아직 토큰 파싱 중이거나, 로그인 안 된 상태
    return <div>로딩 중...</div>;
  }

  return (
    <div className="mainContainer">
      <Header />
      <div className="appContainer">
        <div className="scrollContent">
          <div className={styles.contentWrapper}>
            <div className={styles.titleSection}>
              <h1>내 레시피북</h1>
              <p>즐겨찾는 레시피를 모아보세요!</p>
              <p className={styles.recipeCount}>
                총 {recipeList.length}개의 레시피가 저장되었어요
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
              {recipeList.map((recipe) => {
                const id = recipe.recipeId ?? recipe.rcpSeq;
                const isBookmarked = recipes.some(r => (r.recipeId ?? r.rcpSeq) === id);

                return (
                  <BookmarkCard
                    key={id}
                    recipe={{ ...recipe, bookmarked: isBookmarked }}
                    token={token}
                    onUnbookmark={handleUnbookmark}
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

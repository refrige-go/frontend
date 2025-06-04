'use client'

import Header from '../components/layout/Header'
import BottomNavigation from '../components/layout/BottomNavigation'
import TypeRecommendationsSection from '../components/TypeRecommendationsSection'
import IngredientRecommendationsSection from '../components/IngredientRecommendationsSection'
import WeatherRecommend from '../components/WeatherRecommend'
import SearchWithCategory from '../components/SearchWithCategory'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '../api/axiosInstance'

export default function Home() {
  const router = useRouter();
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

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

  // 마운트 시 찜한 레시피 목록 불러오기
  useEffect(() => {
    if (!token || !userId) return;

    fetch(`${baseUrl}api/bookmark/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setBookmarkedIds(data.map(r => r.recipeId ?? r.rcpSeq)))
      .catch(err => console.error('찜한 레시피 가져오기 실패:', err));
  }, [token, userId]);

  // 찜 추가
  const handleBookmark = (id) => {
    setBookmarkedIds((prev) => [...prev, id]);
  };

  // 찜 해제
  const handleUnbookmark = (id) => {
    setBookmarkedIds((prev) => prev.filter((item) => item !== id));
  };

  return (
    <div className='mainContainer'>
      <Header />
      <div className='appContainer' style={{ position: 'relative' }}>
        <main style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
          <SearchWithCategory
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search"
          />

          <br />

          <WeatherRecommend
            userId={userId}
            bookmarkedIds={bookmarkedIds}
            onBookmark={handleBookmark}
            onUnbookmark={handleUnbookmark}
          />

          <TypeRecommendationsSection
            userId={userId}
            bookmarkedIds={bookmarkedIds}
            onBookmark={handleBookmark}
            onUnbookmark={handleUnbookmark}
          />

          <IngredientRecommendationsSection
            userId={userId}
            bookmarkedIds={bookmarkedIds}
            onBookmark={handleBookmark}
            onUnbookmark={handleUnbookmark}
          />
        </main>
      </div>
      <BottomNavigation />
    </div>
  );
}
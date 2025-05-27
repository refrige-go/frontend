'use client'

import Header from '../components/layout/Header'
import BottomNavigation from '../components/layout/BottomNavigation'
import TypeRecommendationsPageRecommendationsPage from './recommend-cuisine-type/page'
import IngredientRecommendationsSection from './recommend-ingredient/page'
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

          {/* OCR 인식 페이지로 이동하는 버튼만 남김 */}
          <button
            onClick={() => router.push('/ocr')}
            style={{
              position: 'absolute',
              bottom: '100px', // 원하는 위치로 조정
              right: '40px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#f79726',
              color: 'white',
              border: 'none',
              fontSize: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              zIndex: 1000,
              display: 'flex',              // 중앙 정렬
              alignItems: 'center',         // 수직 중앙
              justifyContent: 'center',     // 수평 중앙
              padding: 0

            }}
          >
            <span role="img" aria-label="카메라" style={{ transform: 'translate(1px, -4px)' }}>📷</span>
          </button>

          <TypeRecommendationsPageRecommendationsPage
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
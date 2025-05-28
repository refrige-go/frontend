'use client'

import Header from '../components/layout/Header'
import BottomNavigation from '../components/layout/BottomNavigation'
import TypeRecommendationsSection from '../components/TypeRecommendationsSection'
import IngredientRecommendationsSection from '../components/IngredientRecommendationsSection'
import SearchWithCategory from '../components/SearchWithCategory'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '../api/axiosInstance'

export default function Home() {
  const router = useRouter();
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [search, setSearch] = useState('');


  const userId = 1;




  // 마운트 시 찜한 레시피 목록 불러오기
  useEffect(() => {
    fetch(`http://localhost:8080/api/bookmark/${userId}`)
      .then(res => res.json())
      .then(data => setBookmarkedIds(data.map(r => r.recipeId ?? r.rcpSeq)));
  }, []);

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
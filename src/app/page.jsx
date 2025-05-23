'use client'

import Header from '../components/layout/Header'
import BottomNavigation from '../components/layout/BottomNavigation'
import TypeRecommendationsPageRecommendationsPage from './recommend-cuisine-type/page'
import IngredientRecommendationsSection from './recommend-ingredient/page'
import SearchBar from '../components/SearchBar'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
      <div className='appContainer'>
        <main style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
          <SearchBar
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search"
          />
          
          {/* OCR 인식 페이지로 이동하는 버튼만 남김 */}
          <button
            onClick={() => router.push('/ocr')}
            style={{
              position: 'fixed',
              bottom: '80px',
              right: '20px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#f79726',
              color: 'white',
              border: 'none',
              fontSize: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              zIndex: 1000
            }}
          >
            📷
          </button>

          <TypeRecommendationsPageRecommendationsPage
            bookmarkedIds={bookmarkedIds}
            onBookmark={handleBookmark}
            onUnbookmark={handleUnbookmark}
          />
          <IngredientRecommendationsSection
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
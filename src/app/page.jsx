'use client'

import Link from 'next/link'
import Header from '../components/layout/Header'
import BottomNavigation from '../components/layout/BottomNavigation'
import TypeRecommendationsPageRecommendationsPage from './recommend-cuisine-type/page'
import IngredientRecommendationsSection from './recommend-ingredient/page'
import SearchWithCategory from '../components/SearchWithCategory'
import { useState, useEffect } from 'react';

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

export default function Home() {
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState(null);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('userId');
      if (!id) {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            id = payload.userId || payload.id || payload.sub;
            if (id) localStorage.setItem('userId', id);
          } catch (e) {
            id = null;
          }
        }
      }
      setUserId(id);
    }
  }, []);

  // 마운트 시 찜한 레시피 목록 불러오기
  useEffect(() => {
    if (!userId || userId === 'null' || userId === 'undefined') return;

    const fetchBookmarks = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${baseUrl}api/bookmark/list`, {
          method: 'GET',
          headers: headers,
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          setBookmarkedIds(data.map(r => r.recipeId ?? r.rcpSeq));
        } else {
          console.error('북마크 목록을 불러오는데 실패했습니다:', res.status);
        }
      } catch (error) {
        console.error('북마크 API 호출 에러:', error);
      }
    };

    fetchBookmarks();
  }, [userId]);

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
          <SearchWithCategory
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search"
          />
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

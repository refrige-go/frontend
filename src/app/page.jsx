'use client'

import Link from 'next/link'
import Header from '../components/layout/Header'
import BottomNavigation from '../components/layout/BottomNavigation'
import TypeRecommendationsPageRecommendationsPage from './recommend-cuisine-type/page'
import IngredientRecommendationsSection from './recommend-ingredient/page'
import SearchWithCategory from '../components/SearchWithCategory'
import { useState, useEffect } from 'react';

function getUserIdFromToken() {
  const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.id || payload.sub || null;
  } catch {
    return null;
  }
}

export default function Home() {
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [search, setSearch] = useState('');

  const baseURL = process.env.NEXT_PUBLIC_BASE_API_URL;
  const userId = getUserIdFromToken();

  // 마운트 시 찜한 레시피 목록 불러오기
  useEffect(() => {
    if (!userId) {
      window.location.href = '/login';
      return;
    }
    const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
    fetch(`${baseURL}/api/bookmark/${userId}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) return [];
        return res.json();
      })
      .then(data => setBookmarkedIds(data.map(r => r.recipeId ?? r.rcpSeq)));
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

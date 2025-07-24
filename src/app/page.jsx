'use client'

import Header from '../components/layout/Header'
import BottomNavigation from '../components/layout/BottomNavigation'
import TypeRecommendationsSection from '../components/TypeRecommendationsSection'
import IngredientRecommendationsSection from '../components/IngredientRecommendationsSection'
import WeatherRecommend from '../components/WeatherRecommend'
import SearchWithCategory from '../components/SearchWithCategory'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '../api/axiosInstance'
import InstallPrompt from '../components/pwa/InstallPrompt'
import PWADebugPanel from '../components/pwa/PWADebugPanel'

// 비로그인 상태 안내 컴포넌트
const LoginPrompt = () => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
      borderRadius: '16px',
      padding: '24px',
      margin: '20px 0',
      textAlign: 'center',
      border: '1px solid #fed7aa',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '16px',
      }}>
        👋
      </div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#ea580c',
        marginBottom: '8px',
      }}>
        안녕하세요!
      </h3>
      <p style={{
        fontSize: '14px',
        color: '#9a3412',
        marginBottom: '16px',
        lineHeight: '1.5',
      }}>
        로그인하시면 개인 맞춤형 레시피 추천과<br />
        더 많은 기능을 이용하실 수 있어요!
      </p>
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        <Link href="/login">
          <button style={{
            background: '#ea580c',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}>
            로그인하기
          </button>
        </Link>
        <Link href="/signup">
          <button style={{
            background: 'transparent',
            color: '#ea580c',
            border: '1px solid #ea580c',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}>
            회원가입
          </button>
        </Link>
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

  // 로그인 상태 체크
  useEffect(() => {
    const checkLoginStatus = async () => {
      console.log('[HomePage] 로그인 상태 체크 시작');
      
      const accessToken = localStorage.getItem('accessToken');
      console.log('[HomePage] localStorage accessToken:', accessToken ? 'exists' : 'not found');
      
      if (accessToken) {
        setToken(accessToken);
        setIsLoggedIn(true);
        
        // 저장된 userId와 userInfo 확인
        const storedUserId = localStorage.getItem('userId');
        const storedUserInfo = localStorage.getItem('userInfo');
        
        console.log('[HomePage] localStorage userId:', storedUserId);
        console.log('[HomePage] localStorage userInfo:', storedUserInfo ? 'exists' : 'not found');
        
        if (storedUserId) {
          setUserId(storedUserId);
          console.log('[HomePage] userId 설정:', storedUserId);
        }
        
        if (storedUserInfo) {
          try {
            const parsedUserInfo = JSON.parse(storedUserInfo);
            setUserInfo(parsedUserInfo);
            console.log('[HomePage] 저장된 사용자 정보 사용:', parsedUserInfo);
          } catch (e) {
            console.error('[HomePage] 사용자 정보 파싱 실패:', e);
          }
        }
      } else {
        console.log('[HomePage] 로그인되지 않음');
        setIsLoggedIn(false);
        setUserId(null);
        setUserInfo(null);
      }
      
      setIsLoading(false);
    };

    checkLoginStatus();
  }, []);

  // 로그인 상태 및 userId 변경 시 로그 출력
  useEffect(() => {
    console.log('[HomePage] 상태 변경:', { 
      isLoggedIn, 
      userId, 
      userInfo: userInfo ? userInfo.nickname : null,
      token: token ? 'exists' : 'not found' 
    });
  }, [isLoggedIn, userId, userInfo, token]);

  // 마운트 시 찜한 레시피 목록 불러오기
  useEffect(() => {
    if (!token || !userId) {
      console.log('[HomePage] 찜한 레시피 가져오기 스킵 - token 또는 userId 없음');
      return;
    }

    console.log('[HomePage] 찜한 레시피 가져오기 시작');
    fetch(`${baseUrl}api/bookmark/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        console.log('[HomePage] 찜한 레시피 가져오기 성공:', data);
        setBookmarkedIds(data.map(r => r.recipeId ?? r.rcpSeq));
      })
      .catch(err => console.error('[HomePage] 찜한 레시피 가져오기 실패:', err));
  }, [token, userId, baseUrl]);

  // 찜 추가
  const handleBookmark = (id) => {
    console.log('[HomePage] 찜 추가:', id);
    setBookmarkedIds((prev) => [...prev, id]);
  };

  // 찜 해제
  const handleUnbookmark = (id) => {
    console.log('[HomePage] 찜 해제:', id);
    setBookmarkedIds((prev) => prev.filter((item) => item !== id));
  };

  if (isLoading) {
    return (
      <div className='mainContainer'>
        <Header />
        <div className='appContainer' style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '50vh'
        }}>
          <div>로딩 중...</div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className='mainContainer' style={{ 
      position: 'relative',
      boxSizing: 'border-box'
    }}>
      <InstallPrompt />
      {process.env.NODE_ENV === 'development' && <PWADebugPanel />}
      <Header />
      <div className='appContainer' style={{ position: 'relative' }}>
        <main style={{
            fontFamily: 'sans-serif' ,
            }}>
          <SearchWithCategory
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="레시피를 검색해보세요..."
          />

          {/* 비로그인 상태일 때만 로그인 유도 메시지 표시 */}
          {!isLoggedIn && <LoginPrompt />}

          {/* 로그인 상태일 때만 추천 섹션 3개 표시 */}
          {isLoggedIn && userId && (
            <>
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
            </>
          )}
        </main>
      </div>
      <BottomNavigation />
    </div>
  );
}

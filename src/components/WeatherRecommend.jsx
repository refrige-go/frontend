'use client';

import { useEffect, useState, useRef } from 'react';
import BookmarkCard from '../components/BookmarkCard';
import axiosInstance from '../api/axiosInstance';

export default function WeatherRecommend({ userId, onBookmark, onUnbookmark }) {
  const [status, setStatus] = useState('위치를 가져오는 중...');
  const [recipes, setRecipes] = useState([]);
  const [weather, setWeather] = useState(null);
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });

  // 날씨와 온도에 따른 멘트 반환 함수
  const getWeatherMessage = (conditionText, tempC) => {
    if (conditionText.includes('Rain') || conditionText.includes('Drizzle')) {
      if (tempC <= 5) return '비 오고 추운 날, 따뜻한 요리 어때요?';
      return '비 오는 날, 든든한 요리 어때요?';
    }
    if (conditionText.includes('Snow')) {
      return '눈 오는 날, 따뜻한 요리 어때요?';
    }
    if (conditionText.includes('Sunny') || conditionText.includes('Clear')) {
      if (tempC >= 28) return '맑고 더운 날, 시원한 요리 어때요?';
      return '맑은 날, 이런 요리 어때요?';
    }
    if (conditionText.includes('Cloudy') || conditionText.includes('Overcast')) {
      return '흐린 날, 든든한 요리 어때요?';
    }
    return '오늘 같은 날씨엔 이런 요리 어때요?';
  };

  const sendLocation = async (lat, lon) => {
    try {
      const res = await axiosInstance.post('/api/weather/location', {
        latitude: lat,
        longitude: lon
      });
      setRecipes(res.data.recipes);
      setWeather(res.data.weather);
      setStatus('추천 완료');
    } catch (error) {
      setStatus('서버 전송 실패');
      console.error('날씨 기반 추천 실패:', error);
    }
  };

  const handleBookmark = async (recipeId) => {
    try {
      await onBookmark(recipeId);
      setRecipes(recipes.map(recipe =>
        recipe.rcpSeq === recipeId
          ? { ...recipe, bookmarked: true }
          : recipe
      ));
    } catch (error) {
      console.error('북마크 추가 실패:', error);
    }
  };

  const handleUnbookmark = async (recipeId) => {
    try {
      await onUnbookmark(recipeId);
      setRecipes(recipes.map(recipe =>
        recipe.rcpSeq === recipeId
          ? { ...recipe, bookmarked: false }
          : recipe
      ));
    } catch (error) {
      console.error('북마크 삭제 실패:', error);
    }
  };

  const dragHandlers = {
    onMouseDown: (e) => {
      setIsDragging(true);
      setDragStart({
        x: e.pageX - scrollContainerRef.current.offsetLeft,
        scrollLeft: scrollContainerRef.current.scrollLeft,
      });
    },
    onMouseUp: () => setIsDragging(false),
    onMouseLeave: () => setIsDragging(false),
    onMouseMove: (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - dragStart.x) * 2;
      scrollContainerRef.current.scrollLeft = dragStart.scrollLeft - walk;
    },
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('위치 정보를 지원하지 않는 브라우저입니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log('위치 좌표:', latitude, longitude);
        sendLocation(latitude, longitude);
      },
      () => setStatus('위치 정보를 가져올 수 없습니다.')
    );
  }, []);

  if (status !== '추천 완료') {
    return <div>{status}</div>;
  }

  if (recipes.length === 0) {
    return null;
  }

  return (
    <section style={{ marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
        {weather ? getWeatherMessage(weather.conditionText, weather.tempC) : '오늘 같은 날씨엔 이런 요리 어때요?'}
      </h2>

      <div
        ref={scrollContainerRef}
        className="scroll-container no-scrollbar"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        {...dragHandlers}
      >
        {recipes.map((recipe) => (
          <div className="slide-item" key={recipe.rcpSeq}>
            <BookmarkCard
              recipe={{
                rcpNm: recipe.recipeNm,
                rcpSeq: recipe.rcpSeq,
                rcpCategory: recipe.category,
                image: recipe.image,
                rcpPartsDtls: recipe.rcpPartsDtls,
                cuisineType: recipe.cuisineType,
                rcpWay2: recipe.rcpWay2,
                bookmarked: recipe.bookmarked
              }}
              userId={userId}
              onUnbookmark={handleUnbookmark}
              onBookmark={handleBookmark}
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        .scroll-container {
          display: flex;
          overflow-x: auto;
          gap: 16px;
          padding-bottom: 1rem;
          user-select: none;
        }

        .slide-item {
          flex: 0 0 auto;
          scroll-snap-align: start;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

'use client'

import Header from '../components/layout/Header'
import BottomNavigation from '../components/layout/BottomNavigation'
import TypeRecommendationsPageRecommendationsPage from './recommend-cuisine-type/page'
import IngredientRecommendationsSection from './recommend-ingredient/page'
import SearchBar from '../components/SearchBar'
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const videoRef = useRef(null);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  const userId = 1;

  // 마운트 시 찜한 레시피 목록 불러오기
  useEffect(() => {
    fetch(`http://localhost:8080/api/bookmark/${userId}`)
      .then(res => res.json())
      .then(data => setBookmarkedIds(data.map(r => r.recipeId ?? r.rcpSeq)));
  }, []);

  // 2. 카메라 모달이 열릴 때 카메라 시작
  useEffect(() => {
    if (showCamera) {
      startCamera();
    }
  }, [showCamera]);

  // 카메라 시작
  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('카메라 접근 오류:', error);
        alert('카메라 접근에 실패했습니다.');
      }
    }
  };

  // 사진 촬영
  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 이미지를 Blob으로 변환
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('file', blob, 'capture.jpg');

      try {
        // 파이썬 서버로 이미지 전송
        const response = await fetch('http://localhost:5000/ocr', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          console.log('OCR 결과:', result); // 디버깅용

          // OCR 결과를 쿼리스트링으로 다음 페이지에 전달
          router.push({
            pathname: '/ocr/result',
            query: { 
              data: JSON.stringify(result.ingredients)
            }
          });
        } else {
          alert('OCR 서버 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('OCR 처리 중 오류:', error);
        alert('OCR 처리 중 오류가 발생했습니다.');
      }
    }, 'image/jpg');
  };

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
          
          {/* 카메라 버튼 */}
          <button 
            onClick={() => setShowCamera(true)}
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

          {/* 카메라 모달 */}
          {showCamera && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px'
            }}>
              <div style={{
                width: '100%',
                maxWidth: '400px',
                aspectRatio: '1/1.1',
                position: 'relative',
                marginTop: '20px'
              }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '18px'
                  }}
                />
                <button
                  onClick={capturePhoto}
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    border: '4px solid #f79726',
                    fontSize: '24px',
                    color: '#f79726'
                  }}
                >
                  ●
                </button>
              </div>
              <button
                onClick={() => setShowCamera(false)}
                style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  backgroundColor: '#f79726',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                닫기
              </button>
            </div>
          )}

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
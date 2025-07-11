'use client';

import { useEffect, useState } from 'react';

export default function useServiceWorker() {
  const [swRegistration, setSwRegistration] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // 온라인/오프라인 상태 감지
    const handleOnline = () => {
      console.log('🌐 온라인 상태로 변경');
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      console.log('🚫 오프라인 상태로 변경');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // 초기 상태 설정
    setIsOnline(navigator.onLine);

    if ('serviceWorker' in navigator) {
      console.log('🛠️ Service Worker 등록 시도 중...');
      
      navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // 서비스워커 업데이트 시 캐시 바이패스
      })
        .then((registration) => {
          console.log('✅ Service Worker 등록 성공:', registration.scope);
          setSwRegistration(registration);
          
          // 서비스워커 업데이트 감지
          registration.addEventListener('updatefound', () => {
            console.log('🆕 Service Worker 업데이트 발견!');
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                console.log('🔄 Service Worker 상태 변경:', newWorker.state);
                
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('✨ 새로운 콘텐츠가 이용 가능합니다.');
                  setUpdateAvailable(true);
                  
                  // 사용자에게 업데이트 알림
                  if (window.confirm('새로운 버전이 있습니다. 지금 업데이트하시겠습니까?')) {
                    newWorker.postMessage({ action: 'skipWaiting' });
                    window.location.reload();
                  }
                }
              });
            }
          });
          
          // 주기적 업데이트 체크 (1시간마다)
          setInterval(() => {
            console.log('🔍 Service Worker 업데이트 체크...');
            registration.update();
          }, 60 * 60 * 1000);
          
          // 즉시 업데이트 체크
          registration.update();
        })
        .catch((error) => {
          console.error('❌ Service Worker 등록 실패:', error);
        });
      
      // Service Worker 메시지 수신
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('💬 Service Worker 메시지 수신:', event.data);
        
        if (event.data.action === 'reload') {
          window.location.reload();
        }
      });
      
      // 제어권 변경 이벤트
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Worker 컨트롤러 변경');
        window.location.reload();
      });
      
    } else {
      console.warn('⚠️ Service Worker를 지원하지 않는 브라우저입니다.');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Service Worker 수동 업데이트 함수
  const updateServiceWorker = () => {
    if (swRegistration) {
      swRegistration.update();
    }
  };

  // Service Worker 에서 캐시 지우기
  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log('🗑️ 캐시 삭제:', cacheName);
          return caches.delete(cacheName);
        })
      );
      console.log('✅ 모든 캐시 삭제 완료');
      window.location.reload();
    }
  };

  return {
    isOnline,
    updateAvailable,
    swRegistration,
    updateServiceWorker,
    clearCache
  };
}

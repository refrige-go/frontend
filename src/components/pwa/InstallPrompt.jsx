'use client';

import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt 이벤트 발생!');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      console.log('앱 설치 완료!');
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 디버깅을 위해 강제로 표시 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        console.log('개발 환경: PWA 설치 팝업 강제 표시');
        setShowInstallButton(true);
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // InstallPrompt 표시 여부에 따라 body에 클래스 추가/제거 - 사용 안함
  // useEffect(() => {
  //   if (showInstallButton) {
  //     document.body.classList.add('install-prompt-visible');
  //   } else {
  //     document.body.classList.remove('install-prompt-visible');
  //   }
  //   
  //   return () => {
  //     document.body.classList.remove('install-prompt-visible');
  //   };
  // }, [showInstallButton]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    console.log('PWA 설치 팝업 닫기');
    setShowInstallButton(false);
    // 하루 동안 다시 보이지 않게 하기
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // 하루 지나면 다시 보이게 하기 - 임시 비활성화
  // useEffect(() => {
  //   const dismissed = localStorage.getItem('pwa-install-dismissed');
  //   console.log('PWA 설치 dismiss 상태:', dismissed);
  //   if (dismissed) {
  //     const dismissedTime = parseInt(dismissed);
  //     const oneDayInMs = 24 * 60 * 60 * 1000;
  //     if (Date.now() - dismissedTime < oneDayInMs) {
  //       console.log('PWA 설치 팝업 24시간 내 dismiss됨');
  //       setShowInstallButton(false);
  //     }
  //   }
  // }, []);

  console.log('InstallPrompt 렌더링:', { showInstallButton, deferredPrompt });

  if (!showInstallButton) return null;

  return (
    <div 
      className="pwa-install-popup"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        background: 'linear-gradient(135deg, #f59e42 0%, #ff8c42 100%)',
        color: 'white',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10000,
        fontSize: '14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        borderRadius: '0 0 16px 16px',
        minHeight: '64px',
        
        /* 다른 요소 간섭 방지 */
        pointerEvents: 'auto',
        touchAction: 'manipulation',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '18px' }}>🏠</span>
        <span style={{ fontWeight: '500' }}>냉장GO 앱을 설치하세요!</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer',
            opacity: 0.8,
          }}
        >
          ✕
        </button>
        <button
          onClick={handleInstallClick}
          style={{
            background: 'white',
            color: '#f59e42',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          설치
        </button>
      </div>
    </div>
  );
}

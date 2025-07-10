'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEYS = {
  DISMISSED: 'pwa-install-dismissed',
  PERMANENTLY_DISMISSED: 'pwa-install-permanently-dismissed'
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isPWAInstallable, setIsPWAInstallable] = useState(false);

  // 이미 설치되었는지 체크
  const isStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
  };

  // 팝업을 표시할지 결정하는 함수
  const shouldShowPrompt = () => {
    // 이미 설치된 경우
    if (isStandalone()) {
      console.log('PWA 이미 설치됨 - 팝업 숨김');
      return false;
    }

    // 영구적으로 닫은 경우
    const permanentlyDismissed = localStorage.getItem(STORAGE_KEYS.PERMANENTLY_DISMISSED);
    if (permanentlyDismissed === 'true') {
      console.log('PWA 설치 팝업 영구적으로 닫음');
      return false;
    }

    // 오늘 하루 닫은 경우
    const dismissed = localStorage.getItem(STORAGE_KEYS.DISMISSED);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      if (Date.now() - dismissedTime < ONE_DAY_MS) {
        console.log('PWA 설치 팝업 오늘 하루 닫음');
        return false;
      }
    }

    return true;
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      console.log('✅ beforeinstallprompt 이벤트 발생!');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsPWAInstallable(true);
      
      // 팝업 표시 조건 체크
      if (shouldShowPrompt()) {
        setShowInstallButton(true);
      }
    };

    const handleAppInstalled = () => {
      console.log('✅ 앱 설치 완료!');
      setShowInstallButton(false);
      setDeferredPrompt(null);
      setIsPWAInstallable(false);
      // 설치 완료 시 저장된 dismiss 정보 제거
      localStorage.removeItem(STORAGE_KEYS.DISMISSED);
      localStorage.removeItem(STORAGE_KEYS.PERMANENTLY_DISMISSED);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 개발 환경에서 디버깅용 강제 표시
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        console.log('🔧 개발 환경: PWA 설치 팝업 강제 표시');
        setIsPWAInstallable(true);
        if (shouldShowPrompt()) {
          setShowInstallButton(true);
        }
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('🚀 PWA 설치 버튼 클릭');
    
    if (!deferredPrompt) {
      console.warn('⚠️ deferredPrompt가 없습니다.');
      // 개발 환경에서는 설명 메시지 표시
      if (process.env.NODE_ENV === 'development') {
        alert('개발 환경에서는 실제 설치가 불가능합니다.\n\nPC Chrome에서 테스트하려면:\n1. HTTPS 환경 필요\n2. 브라우저 주소창 오른쪽 설치 아이콘 확인\n3. 또는 Chrome 메뉴 > "앱 설치" 확인');
      }
      return;
    }

    try {
      console.log('📱 PWA 설치 프롬프트 표시 중...');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('👤 사용자 선택:', outcome);
      
      if (outcome === 'accepted') {
        console.log('✅ 사용자가 설치를 선택함');
        setShowInstallButton(false);
      } else {
        console.log('❌ 사용자가 설치를 거부함');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('❌ PWA 설치 중 오류:', error);
    }
  };

  const handleDismiss = () => {
    console.log('⏰ PWA 설치 팝업 - 오늘 하루 보지 않기');
    setShowInstallButton(false);
    localStorage.setItem(STORAGE_KEYS.DISMISSED, Date.now().toString());
  };

  const handlePermanentDismiss = () => {
    console.log('🚫 PWA 설치 팝업 - 다시 보지 않기');
    setShowInstallButton(false);
    localStorage.setItem(STORAGE_KEYS.PERMANENTLY_DISMISSED, 'true');
  };

  console.log('InstallPrompt 렌더링:', { showInstallButton, deferredPrompt, isPWAInstallable });

  if (!showInstallButton) return null;

  return (
    <div 
      className="pwa-install-popup"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        background: 'linear-gradient(135deg, #f59e42 0%, #ff8c42 100%)',
        color: 'white',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 99999, // 최상위 zIndex
        fontSize: '14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        
        /* 모바일 최적화 */
        pointerEvents: 'auto',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
      }}>
      
      {/* 메인 콘텐츠 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🏠</span>
          <div>
            <div style={{ fontWeight: '600', fontSize: '15px' }}>냉장GO 앱 설치</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>빠른 접근과 오프라인 사용</div>
          </div>
        </div>
        
        <button
          onClick={handleInstallClick}
          style={{
            background: 'white',
            color: '#f59e42',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            transition: 'all 0.2s ease',
          }}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          ⬇️ 설치
        </button>
      </div>
      
      {/* 하단 버튼들 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingTop: '4px',
        borderTop: '1px solid rgba(255,255,255,0.2)'
      }}>
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            color: 'white',
            border: 'none',
            padding: '4px',
            fontSize: '11px',
            cursor: 'pointer',
            opacity: 0.8,
            textDecoration: 'underline',
          }}
        >
          오늘 하루 보지 않기
        </button>
        
        <button
          onClick={handlePermanentDismiss}
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
          다시 보지 않기 ✕
        </button>
      </div>
    </div>
  );
}

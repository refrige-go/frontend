'use client';

import { useState, useEffect } from 'react';

export default function PWADebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const [installPromptEvent, setInstallPromptEvent] = useState(null);

  useEffect(() => {
    const updateDebugInfo = () => {
      const info = {
        // 기본 PWA 지원 확인
        serviceWorkerSupported: 'serviceWorker' in navigator,
        isSecureContext: window.isSecureContext,
        isStandalone: window.matchMedia('(display-mode: standalone)').matches,
        
        // iOS 관련
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        isIOSStandalone: window.navigator.standalone,
        
        // Android 관련
        isAndroid: /Android/.test(navigator.userAgent),
        androidStandalone: document.referrer.includes('android-app://'),
        
        // 브라우저 정보
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        
        // PWA 설치 가능 여부
        hasInstallPrompt: !!installPromptEvent,
        
        // 현재 URL 정보
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        
        // 매니페스트 확인
        manifestLink: document.querySelector('link[rel="manifest"]')?.href,
        
        // 서비스워커 상태
        swController: !!navigator.serviceWorker?.controller,
        swReady: false
      };
      
      // 서비스워커 ready 상태 확인
      if (navigator.serviceWorker) {
        navigator.serviceWorker.ready.then(() => {
          setDebugInfo(prev => ({ ...prev, swReady: true }));
        });
      }
      
      setDebugInfo(info);
    };

    updateDebugInfo();

    // beforeinstallprompt 이벤트 감지
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      updateDebugInfo();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [installPromptEvent]);

  const triggerInstall = async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const result = await installPromptEvent.userChoice;
      console.log('설치 결과:', result);
      setInstallPromptEvent(null);
    } else {
      alert('설치 프롬프트를 사용할 수 없습니다.');
    }
  };

  const checkManifest = async () => {
    try {
      const response = await fetch('/manifest.json');
      const manifest = await response.json();
      console.log('매니페스트 내용:', manifest);
      alert('매니페스트 파일을 콘솔에서 확인하세요.');
    } catch (error) {
      console.error('매니페스트 로드 실패:', error);
      alert('매니페스트 파일을 로드할 수 없습니다.');
    }
  };

  const clearPWAData = async () => {
    // 로컬스토리지 PWA 관련 데이터 삭제
    localStorage.removeItem('pwa-install-dismissed');
    localStorage.removeItem('pwa-install-permanently-dismissed');
    
    // 캐시 삭제
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    alert('PWA 데이터가 삭제되었습니다. 페이지를 새로고침합니다.');
    window.location.reload();
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 50000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        }}
      >
        🔧
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '300px',
      maxHeight: '80vh',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '10px',
      zIndex: 100000,
      fontSize: '12px',
      overflow: 'auto',
      fontFamily: 'monospace',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '14px' }}>PWA 디버그 패널</h3>
        <button 
          onClick={() => setIsVisible(false)}
          style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#4CAF50' }}>PWA 지원 상태</h4>
        <div>SW 지원: {debugInfo.serviceWorkerSupported ? '✅' : '❌'}</div>
        <div>보안 컨텍스트: {debugInfo.isSecureContext ? '✅' : '❌'}</div>
        <div>SW 활성화: {debugInfo.swController ? '✅' : '❌'}</div>
        <div>SW Ready: {debugInfo.swReady ? '✅' : '❌'}</div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#FF9800' }}>설치 상태</h4>
        <div>스탠드얼론: {debugInfo.isStandalone ? '✅' : '❌'}</div>
        <div>설치 프롬프트: {debugInfo.hasInstallPrompt ? '✅' : '❌'}</div>
        <div>iOS: {debugInfo.isIOS ? '✅' : '❌'}</div>
        <div>iOS 설치됨: {debugInfo.isIOSStandalone ? '✅' : '❌'}</div>
        <div>Android: {debugInfo.isAndroid ? '✅' : '❌'}</div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#2196F3' }}>환경 정보</h4>
        <div>프로토콜: {debugInfo.protocol}</div>
        <div>호스트: {debugInfo.hostname}</div>
        <div>매니페스트: {debugInfo.manifestLink ? '✅' : '❌'}</div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#9C27B0' }}>액션</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={triggerInstall}
            disabled={!debugInfo.hasInstallPrompt}
            style={{
              padding: '8px',
              backgroundColor: debugInfo.hasInstallPrompt ? '#4CAF50' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: debugInfo.hasInstallPrompt ? 'pointer' : 'not-allowed',
              fontSize: '11px'
            }}
          >
            {debugInfo.hasInstallPrompt ? '📱 설치 트리거' : '설치 불가능'}
          </button>
          
          <button 
            onClick={checkManifest}
            style={{
              padding: '8px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            📄 매니페스트 확인
          </button>
          
          <button 
            onClick={clearPWAData}
            style={{
              padding: '8px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            🗑️ PWA 데이터 삭제
          </button>
        </div>
      </div>

      <div style={{ fontSize: '10px', color: '#ccc', borderTop: '1px solid #333', paddingTop: '10px' }}>
        <div>User Agent: {debugInfo.userAgent?.slice(0, 50)}...</div>
        <div>Platform: {debugInfo.platform}</div>
      </div>
    </div>
  );
}

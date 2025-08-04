"use client";

import '../styles/globals.css';
import { Suspense } from 'react';
import useFcmToken from "../hooks/useFcmToken";
import useServiceWorker from "../hooks/useServiceWorker";


export default function RootLayout({ children }) {
  useFcmToken();
  useServiceWorker();
  
  return (
    <html lang="ko">
      <head>
        {/* 기본 메타 태그 */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <title>냉장GO</title>
        <meta name="description" content="식재료 관리와 AI 기반 레시피 추천 서비스" />
        
        {/* PWA 메타 태그 */}
        <meta name="theme-color" content="#f59e42" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="냉장GO" />
        
        {/* iOS 아이콘 */}
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.png" />
        
        {/* PWA 매니페스트 */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* 파비콘 */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* 모바일 주소창 숨기기 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* iOS 스플래시 스크린 대응 */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* 스크롤 방지 */}
        <style dangerouslySetInnerHTML={{
          __html: `
            body {
              overflow-x: hidden;
              -webkit-overflow-scrolling: touch;
            }
            
            /* iOS 안전 영역 변수 */
            :root {
              --safe-area-inset-top: env(safe-area-inset-top);
              --safe-area-inset-bottom: env(safe-area-inset-bottom);
              --safe-area-inset-left: env(safe-area-inset-left);
              --safe-area-inset-right: env(safe-area-inset-right);
            }
          `
        }} />
      </head>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
        <div id="root-portal"></div>
      </body>
    </html>
  );
}

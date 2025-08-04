'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Header = () => {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0, /* 중앙 정렬 제거 */
        width: '100%', /* 전체 너비 사용 */
        height: '60px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px', /* 메인 콘텐츠와 동일한 패딩 */
        boxSizing: 'border-box',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 1002, /* 스크롤 콘텐츠보다 높은 z-index */
      }}
    >
      {/* 로고 */}
      <div
        onClick={handleLogoClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          fontWeight: 'bold',
          fontSize: '2rem',
          userSelect: 'none',
          cursor: 'pointer',
        }}
      >
        {/* 냉장고 이미지 */}
        <img
          src="/images/logo.svg"
          alt="로고"
          style={{
            width: 100,
            height: 100,
            marginRight: 6,
            objectFit: 'contain',
            verticalAlign: 'middle',
          }}
        />
      </div>
      {/* 우측 아이콘들 */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {/* 알림 아이콘 */}
        <Link href="/notifications" style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/images/bell.svg"
            alt="알림"
            style={{
              width: 24,
              height: 24,
              objectFit: 'contain',
              cursor: 'pointer',
            }}
          />
        </Link>
      </div>
      
      {/* 기기별 패딩 조정을 위한 스타일 */}
      <style jsx>{`
        /* iPhone SE (375px) */
        @media (max-width: 375px) {
          header {
            padding: 0 14px !important;
          }
        }

        /* iPhone 12/13/14 (390-393px) */
        @media (min-width: 376px) and (max-width: 393px) {
          header {
            padding: 0 16px !important;
          }
        }

        /* iPhone 14 Pro Max (430px) */
        @media (min-width: 394px) and (max-width: 430px) {
          header {
            padding: 0 18px !important;
          }
        }

        /* 대형 모바일 기기 (430px+) */
        @media (min-width: 431px) and (max-width: 500px) {
          header {
            padding: 0 20px !important;
          }
        }

        /* PC 환경에서만 헤더 중앙 정렬 및 너비 제한 */
        @media (min-width: 501px) {
          header {
            position: fixed !important;
            top: 20px !important; /* PC 환경 상단 여백 고려 */
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 430px !important;
            border-radius: 12px 12px 0 0 !important;
            padding: 0 20px !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;

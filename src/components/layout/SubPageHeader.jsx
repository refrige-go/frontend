'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const SubPageHeader = ({ title, onBack, rightAction }) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0, /* 중앙 정렬 제거 */
        width: '100%', /* 전체 너비 사용 */
        height: '60px', // 메인 헤더와 동일한 높이
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
      {/* 뒤로가기 버튼 */}
      <button
        onClick={handleBack}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          color: '#333',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '40px',
          minHeight: '40px',
          borderRadius: '8px',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        ←
      </button>

      {/* 페이지 제목 */}
      <h1
        style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#333',
          margin: 0,
          flex: 1,
          textAlign: 'center',
          paddingLeft: '40px', // 뒤로가기 버튼 너비만큼 보상
          paddingRight: '40px', // 오른쪽 액션 버튼 너비만큼 보상
        }}
      >
        {title}
      </h1>

      {/* 오른쪽 액션 버튼 */}
      <div
        style={{
          minWidth: '40px',
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {rightAction || <div style={{ width: '40px' }} />}
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
            top: 20px !important;
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

export default SubPageHeader;

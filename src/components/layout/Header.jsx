// src/components/layout/Header.jsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const Header = () => {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <header
      style={{
        width: '420px',
        height: '60px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px 0 28px',
        boxSizing: 'border-box',
        borderBottom: '2px solid #e5e7eb',
        position: 'fixed',
        zIndex: 10,
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
          cursor: 'pointer', // 클릭 가능함을 표시
        }}
      >
        {/* 냉장고 이미지 */}
        <img
          src="/images/logo.svg"
          alt="로고"
          style={{
            width: 100, // 크기 조정
            height: 100, // 크기 조정
            marginRight: 6,
            objectFit: 'contain',
            verticalAlign: 'middle',
          }}
        />
      </div>
      {/* 우측 아이콘들 */}
      <div style={{ display: 'flex', gap: '16px' }}> {/* 아이콘들을 감싸는 컨테이너 */}
        {/* 알림 아이콘 */}
        <img
          src="/images/bell.svg"
          alt="알림"
          style={{
            width: 24, // 크기 조정
            height: 24, // 크기 조정
            objectFit: 'contain',
            cursor: 'pointer', // 클릭 가능함을 표시
          }}
        />
      </div>
    </header>
  );
};

export default Header;
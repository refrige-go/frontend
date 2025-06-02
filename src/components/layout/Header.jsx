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
        zIndex: 1000,
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
      <div style={{ display: 'flex', gap: '16px' }}> {/* 아이콘들을 감싸는 컨테이너 */}
        {/* 알림 아이콘 */}
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
      </div>
    </header>
  );
};

export default Header;
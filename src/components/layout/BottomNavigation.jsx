// src/components/layout/BottomNavigation.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    key: 'home',
    label: '홈',
    icon: '/images/home.svg',
    href: '/',
    activeColor: '#f59e42',
  },
  {
    key: 'refrigerator',
    label: '냉장고',
    icon: '/images/Vector.svg',
    href: '/refrigerator',
    activeColor: '#f59e42',
  },
  {
    key: 'recipes',
    label: '레시피',
    icon: '/images/bookmark.svg',
    href: '/bookmark-page',
    activeColor: '#f59e42',
  },
  {
    key: 'mypage',
    label: '마이페이지',
    icon: '/images/user.svg',
    href: '/mypage',
    activeColor: '#f59e42',
  },
];

const BottomNavigation = ({ className = '' }) => {
  const pathname = usePathname();

  const isItemActive = (item) => {
    if (item.href === '/') return pathname === '/';
    return pathname.startsWith(item.href);
  };

  return (
    <nav
      style={{
        position: 'fixed',
        width: '420px',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: '2px solid #e5e7eb',
        zIndex: 1000,
        height: 70,
        maxWidth: '100%', // 추가: 최대 너비 제한
        margin: '0 auto', // 추가: 중앙 정렬
      }}
      className={className}
    >
      <ul
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '100%',
          margin: 0,
          padding: '0 16px', // 추가: 좌우 패딩
          listStyle: 'none',
          maxWidth: '100%', // 추가: 최대 너비 제한
        }}
      >
        {navItems.map((item) => {
          const isActive = isItemActive(item);
          return (
            <li
              key={item.key}
              style={{
                flex: 1, // 추가: 균등 분배
                maxWidth: '25%', // 추가: 최대 너비 제한
                textAlign: 'center', // 추가: 중앙 정렬
              }}
            >
              <Link
                href={item.href}
                style={{
                  textDecoration: 'none',
                  display: 'block', // 추가: 블록 레벨 요소로
                  width: '100%', // 추가: 전체 너비 사용
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    color: isActive ? item.activeColor : '#666',
                    padding: '8px 0', // 추가: 클릭 영역 확장
                  }}
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    style={{
                      width: 24, // 수정: 크기 조정
                      height: 24, // 수정: 크기 조정
                      marginBottom: 4,
                      filter: isActive
                        ? 'invert(67%) sepia(51%) saturate(1022%) hue-rotate(346deg) brightness(101%) contrast(87%)' // 주황색 필터
                        : 'grayscale(100%) brightness(0.7)',
                      transition: 'all 0.2s ease', // 추가: 부드러운 전환
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12, // 수정: 폰트 크기 조정
                      fontWeight: isActive ? 'bold' : 'normal',
                      color: isActive ? item.activeColor : '#666',
                      marginTop: 2,
                      transition: 'all 0.2s ease', // 추가: 부드러운 전환
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNavigation;
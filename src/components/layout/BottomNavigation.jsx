'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// 로그인 여부 확인 (accessToken이 localStorage에 있으면 로그인 상태)
function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem('accessToken');
}

// navItems 배열은 그대로 사용
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
  const router = useRouter();

  const isItemActive = (item) => {
    if (item.href === '/') return pathname === '/';
    return pathname.startsWith(item.href);
  };

  // 마이페이지 클릭시 로그인 상태 따라 경로 변경
  const handleMypageClick = (e) => {
    e.preventDefault();
    if (isLoggedIn()) {
      router.push('/mypage');
    } else {
      router.push('/login');
    }
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
        maxWidth: '100%',
        margin: '0 auto',
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
          padding: '0 16px',
          listStyle: 'none',
          maxWidth: '100%',
        }}
      >
        {navItems.map((item) => {
          const isActive = isItemActive(item);

          // 마이페이지는 특별 처리!
          if (item.key === "mypage") {
            return (
              <li
                key={item.key}
                style={{
                  flex: 1,
                  maxWidth: '25%',
                  textAlign: 'center',
                }}
              >
                <a
                  href={isLoggedIn() ? '/mypage' : '/login'}
                  onClick={handleMypageClick}
                  style={{
                    textDecoration: 'none',
                    display: 'block',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      color: isActive ? item.activeColor : '#666',
                      padding: '8px 0',
                    }}
                  >
                    <img
                      src={item.icon}
                      alt={item.label}
                      style={{
                        width: 24,
                        height: 24,
                        marginBottom: 4,
                        filter: isActive
                          ? 'invert(67%) sepia(51%) saturate(1022%) hue-rotate(346deg) brightness(101%) contrast(87%)'
                          : 'grayscale(100%) brightness(0.7)',
                        transition: 'all 0.2s ease',
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: isActive ? 'bold' : 'normal',
                        color: isActive ? item.activeColor : '#666',
                        marginTop: 2,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                </a>
              </li>
            );
          }

          // 그 외 메뉴들은 기존대로 Link 사용
          return (
            <li
              key={item.key}
              style={{
                flex: 1,
                maxWidth: '25%',
                textAlign: 'center',
              }}
            >
              <Link
                href={item.href}
                style={{
                  textDecoration: 'none',
                  display: 'block',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    color: isActive ? item.activeColor : '#666',
                    padding: '8px 0',
                  }}
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    style={{
                      width: 24,
                      height: 24,
                      marginBottom: 4,
                      filter: isActive
                        ? 'invert(67%) sepia(51%) saturate(1022%) hue-rotate(346deg) brightness(101%) contrast(87%)'
                        : 'grayscale(100%) brightness(0.7)',
                      transition: 'all 0.2s ease',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: isActive ? 'bold' : 'normal',
                      color: isActive ? item.activeColor : '#666',
                      marginTop: 2,
                      transition: 'all 0.2s ease',
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

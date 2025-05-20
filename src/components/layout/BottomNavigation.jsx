// components/layout/BottomNavigation.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { colors, componentColors } from '../styles/colors';

const BottomNavigation = ({ className = '' }) => {
  const pathname = usePathname();

  const navItems = [
    {
      key: 'home',
      label: '홈',
      icon: '🏠',
      href: '/',
      color: colors.primary[500], // 기본 홈 색상
    },
    {
      key: 'refrigerator',
      label: '냉장고',
      icon: '🥬',
      href: '/refrigerator',
      color: colors.primary[500], // 냉장고 색상
    },
    {
      key: 'recipes',
      label: '레시피',
      icon: '📖',
      href: '/recipes',
      color: colors.secondary[500], // 레시피 색상
    },
    {
      key: 'bookmarks',
      label: '북마크',
      icon: '🔖',
      href: '/bookmarks',
      color: colors.special.highlight, // 북마크 색상
    },
    {
      key: 'mypage',
      label: '마이페이지',
      icon: '👤',
      href: '/mypage',
      color: colors.accent.light, // 마이페이지 색상
    },
  ];

  const getContainerStyles = () => {
    return {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: componentColors.navigation.background,
      borderTop: `1px solid ${colors.neutral[200]}`,
      padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
      zIndex: 1000,
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
    };
  };

  const getNavListStyles = () => {
    return {
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      listStyle: 'none',
      margin: 0,
      padding: '0 16px',
    };
  };

  const getNavItemStyles = (item, isActive) => {
    return {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '8px 12px',
      borderRadius: '12px',
      textDecoration: 'none',
      transition: 'all 0.2s ease-in-out',
      backgroundColor: isActive ? `${item.color}20` : 'transparent',
      minWidth: '64px',
    };
  };

  const getIconStyles = (item, isActive) => {
    return {
      fontSize: '20px',
      marginBottom: '4px',
      opacity: isActive ? 1 : 0.7,
      transform: isActive ? 'scale(1.1)' : 'scale(1)',
      transition: 'all 0.2s ease-in-out',
    };
  };

  const getLabelStyles = (item, isActive) => {
    return {
      fontSize: '10px',
      fontWeight: isActive ? 'bold' : 'normal',
      color: isActive ? item.color : componentColors.navigation.inactive,
      fontFamily: 'Arial, sans-serif',
      transition: 'all 0.2s ease-in-out',
    };
  };

  const isItemActive = (item) => {
    if (item.href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(item.href);
  };

  return (
    <nav style={getContainerStyles()} className={className}>
      <ul style={getNavListStyles()}>
        {navItems.map((item) => {
          const isActive = isItemActive(item);

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                style={getNavItemStyles(item, isActive)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = componentColors.navigation.hover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={getIconStyles(item, isActive)}>
                  {item.icon}
                </span>
                <span style={getLabelStyles(item, isActive)}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNavigation;
// components/layout/Header.jsx
'use client';

import React from 'react';
import { colors, componentColors } from '../styles/colors';

const Header = ({
  title = '냉장GO',
  variant = 'white',
  showBackButton = false,
  showMenuButton = false,
  showNotification = false,
  onBackClick,
  onMenuClick,
  onNotificationClick,
  className = '',
  children
}) => {
  const getHeaderStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      height: '60px',
      boxSizing: 'border-box',
      position: 'relative',
      fontFamily: 'Arial, sans-serif',
    };

    const variantStyles = {
      white: {
        backgroundColor: colors.neutral.white,
        color: colors.primary[500],
        borderBottom: `1px solid ${colors.neutral[200]}`,
      },
      primary: {
        backgroundColor: componentColors.header.background,
        color: componentColors.header.text,
      },
      secondary: {
        backgroundColor: colors.secondary[500],
        color: colors.neutral.white,
      },
      accent: {
        backgroundColor: colors.accent.medium,
        color: colors.neutral.white,
      },
      refrigerator: {
        backgroundColor: colors.primary[500],
        color: colors.neutral.white,
      },
      recipeBook: {
        backgroundColor: colors.special.highlight,
        color: colors.neutral.white,
      },
      myPage: {
        backgroundColor: colors.accent.light,
        color: colors.neutral.white,
      },
    };

    return {
      ...baseStyles,
      ...variantStyles[variant],
    };
  };

  const getTitleStyles = () => {
    return {
      fontSize: '18px',
      fontWeight: 'bold',
      textAlign: 'center',
      flex: '1',
      margin: '0 16px',
    };
  };

  const getIconButtonStyles = () => {
    return {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '16px',
      color: 'inherit',
      transition: 'all 0.2s ease-in-out',
    };
  };

  const getLogoStyles = () => {
    return {
      fontSize: '20px',
      fontWeight: 'bold',
      color: 'inherit',
      textDecoration: 'none',
    };
  };

  return (
    <header style={getHeaderStyles()} className={className}>
      {/* Left Side */}
      <div style={{ display: 'flex', alignItems: 'center', minWidth: '40px' }}>
        {showBackButton && (
          <button
            style={getIconButtonStyles()}
            onClick={onBackClick}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            ←
          </button>
        )}
      </div>

      {/* Center - Title */}
      <div style={getTitleStyles()}>
        {children ? children : title}
      </div>

      {/* Right Side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '40px', justifyContent: 'flex-end' }}>
        {showNotification && (
          <button
            style={getIconButtonStyles()}
            onClick={onNotificationClick}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            🔔
          </button>
        )}
        {showMenuButton && (
          <button
            style={getIconButtonStyles()}
            onClick={onMenuClick}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            ⚙
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
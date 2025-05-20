// components/layout/Layout.jsx
'use client';

import React from 'react';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import { colors } from '../styles/colors';

const Layout = ({
  children,
  headerProps = {},
  showHeader = true,
  showNavigation = true,
  fullHeight = true,
  backgroundColor = colors.surface.primary,
  className = '',
  style = {},
}) => {
  const getContainerStyles = () => {
    const baseStyles = {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor,
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
    };

    const heightStyles = fullHeight
      ? {
        minHeight: '100vh',
        height: '100vh',
        overflow: 'hidden',
      }
      : {
        minHeight: '100vh',
      };

    return {
      ...baseStyles,
      ...heightStyles,
      ...style,
    };
  };

  const getMainStyles = () => {
    const padding = {
      paddingTop: showHeader ? '0' : '16px',
      paddingBottom: showNavigation ? '80px' : '16px',
      paddingLeft: '0',
      paddingRight: '0',
    };

    const scrollStyles = fullHeight
      ? {
        flex: 1,
        overflow: 'auto',
        overflowX: 'hidden',
      }
      : {
        flex: 1,
      };

    return {
      ...padding,
      ...scrollStyles,
      position: 'relative',
    };
  };

  return (
    <div style={getContainerStyles()} className={className}>
      {showHeader && <Header {...headerProps} />}
      <main style={getMainStyles()}>
        {children}
      </main>
      {showNavigation && <BottomNavigation />}
    </div>
  );
};

// 페이지 컨테이너 컴포넌트
export const PageContainer = ({
  children,
  padding = 'medium',
  maxWidth = undefined,
  centered = false,
  className = '',
  style = {},
}) => {
  const paddingStyles = {
    none: { padding: '0' },
    small: { padding: '12px' },
    medium: { padding: '16px' },
    large: { padding: '24px' },
  };

  const containerStyles = {
    width: '100%',
    ...paddingStyles[padding],
    ...(maxWidth && { maxWidth }),
    ...(centered && {
      marginLeft: 'auto',
      marginRight: 'auto',
    }),
    ...style,
  };

  return (
    <div style={containerStyles} className={className}>
      {children}
    </div>
  );
};

// 섹션 컴포넌트
export const Section = ({
  children,
  title,
  subtitle,
  action,
  spacing = 'medium',
  className = '',
  style = {},
}) => {
  const spacingStyles = {
    small: { marginBottom: '16px' },
    medium: { marginBottom: '24px' },
    large: { marginBottom: '32px' },
  };

  const sectionStyles = {
    width: '100%',
    ...spacingStyles[spacing],
    ...style,
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  };

  const titleStyles = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: colors.neutral[900],
    margin: 0,
    fontFamily: 'Arial, sans-serif',
  };

  const subtitleStyles = {
    fontSize: '14px',
    color: colors.neutral[600],
    margin: '4px 0 0 0',
    fontFamily: 'Arial, sans-serif',
  };

  return (
    <section style={sectionStyles} className={className}>
      {(title || action) && (
        <div style={headerStyles}>
          <div>
            {title && <h2 style={titleStyles}>{title}</h2>}
            {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
};

// 그리드 컴포넌트
export const Grid = ({
  children,
  columns = 1,
  gap = 'medium',
  className = '',
  style = {},
}) => {
  const gapStyles = {
    small: '8px',
    medium: '16px',
    large: '24px',
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: gapStyles[gap],
    width: '100%',
    ...style,
  };

  return (
    <div style={gridStyles} className={className}>
      {children}
    </div>
  );
};

// 플렉스 컴포넌트
export const Flex = ({
  children,
  direction = 'row',
  justify = 'flex-start',
  align = 'flex-start',
  gap = 'medium',
  wrap = false,
  className = '',
  style = {},
}) => {
  const gapStyles = {
    none: '0',
    small: '8px',
    medium: '16px',
    large: '24px',
  };

  const flexStyles = {
    display: 'flex',
    flexDirection: direction,
    justifyContent: justify,
    alignItems: align,
    gap: gapStyles[gap],
    flexWrap: wrap ? 'wrap' : 'nowrap',
    ...style,
  };

  return (
    <div style={flexStyles} className={className}>
      {children}
    </div>
  );
};

// 스페이서 컴포넌트
export const Spacer = ({ size = 'medium', direction = 'vertical' }) => {
  const sizeStyles = {
    small: '8px',
    medium: '16px',
    large: '24px',
    xlarge: '32px',
  };

  const spacerStyles = direction === 'vertical'
    ? { height: sizeStyles[size], width: '100%' }
    : { width: sizeStyles[size], height: '100%' };

  return <div style={spacerStyles} />;
};

// 컴포넌트들을 Layout의 속성으로 추가
Layout.PageContainer = PageContainer;
Layout.Section = Section;
Layout.Grid = Grid;
Layout.Flex = Flex;
Layout.Spacer = Spacer;

export default Layout;
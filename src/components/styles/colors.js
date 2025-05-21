// colors.js - 냉장GO 앱 컬러 시스템

export const colors = {
  // === PRIMARY COLORS ===
  primary: {
    // 메인 브랜드 컬러 (오렌지 계열)
    50: '#FFF7ED',    // 매우 연한 오렌지
    100: '#FFEDD5',   // 연한 오렌지
    200: '#FED7AA',   // 밝은 오렌지
    300: '#FDBA74',   // 중간 오렌지
    400: '#FB923C',   // 진한 오렌지
    500: '#F79726',   // 메인 오렌지 ✨
    600: '#EA580C',   // 어두운 오렌지
    700: '#C2410C',   // 매우 어두운 오렌지
    800: '#9A3412',   // 갈색에 가까운 오렌지
    900: '#7C2D12',   // 가장 어두운 오렌지
  },

  // === SECONDARY COLORS ===
  secondary: {
    // 보조 컬러 (옐로우/골드 계열)
    50: '#FEFCE8',    // 매우 연한 노랑
    100: '#FEF3C7',   // 연한 노랑
    200: '#FDE68A',   // 밝은 노랑
    300: '#FCD34D',   // 중간 노랑
    400: '#FBBF24',   // 진한 노랑
    500: '#F2DC6D',   // 메인 골드 ✨
    600: '#D97706',   // 어두운 노랑
    700: '#B45309',   // 매우 어두운 노랑
    800: '#92400E',   // 갈색에 가까운 노랑
    900: '#78350F',   // 가장 어두운 노랑
  },

  // === ACCENT COLORS ===
  accent: {
    // 강조 컬러 (따뜻한 브라운 계열)
    light: '#F2A35E',   // 밝은 브라운 오렌지 ✨
    medium: '#F28A2E',  // 중간 브라운 오렌지 ✨
    dark: '#F28729',    // 어두운 브라운 오렌지 ✨
    deeper: '#A65729',  // 깊은 브라운 ✨
  },

  // === NEUTRAL COLORS ===
  neutral: {
    // 뉴트럴 컬러 (그레이 계열)
    white: '#FFFFFF',   // 순백 ✨
    50: '#FAFAFA',      // 매우 연한 회색
    100: '#F5F5F5',     // 연한 회색
    200: '#EEEEEE',     // 밝은 회색 ✨
    300: '#E0E0E0',     // 중간 연한 회색
    400: '#BDBDBD',     // 중간 회색
    500: '#9E9E9E',     // 기본 회색
    600: '#888888',     // 어두운 회색 ✨
    700: '#666666',     // 매우 어두운 회색 ✨
    800: '#424242',     // 거의 검은 회색
    900: '#333333',     // 검정에 가까운 회색 ✨
    black: '#000000',   // 순검정
  },

  // === SURFACE COLORS ===
  surface: {
    // 배경 및 표면 컬러
    primary: '#F2EBDC',    // 메인 배경 (베이지) ✨
    secondary: '#F2DDB6',  // 보조 배경 (연한 베이지) ✨
    card: '#FFFFFF',       // 카드 배경
    overlay: 'rgba(0, 0, 0, 0.5)', // 오버레이
  },

  // === SEMANTIC COLORS ===
  semantic: {
    // 의미적 컬러
    success: {
      light: '#D1FAE5',
      medium: '#10B981',
      dark: '#065F46',
    },
    warning: {
      light: '#FEF3C7',
      medium: '#F59E0B',
      dark: '#92400E',
    },
    error: {
      light: '#FEE2E2',
      medium: '#EF4444',
      dark: '#991B1B',
    },
    info: {
      light: '#DBEAFE',
      medium: '#3B82F6',
      dark: '#1E40AF',
    },
  },

  // === SPECIAL COLORS ===
  special: {
    // 특별한 용도의 컬러
    highlight: '#99A63C',  // 하이라이트 (올리브 그린) ✨
    gold: '#F2C063',       // 골드 ✨
    bronze: '#CD7F32',     // 브론즈
    gradient: {
      primary: 'linear-gradient(135deg, #F79726 0%, #F28A2E 100%)',
      secondary: 'linear-gradient(135deg, #F2DC6D 0%, #F2C063 100%)',
      surface: 'linear-gradient(135deg, #F2EBDC 0%, #F2DDB6 100%)',
    },
  },
};

// === THEME VARIANTS ===
export const themes = {
  light: {
    background: colors.surface.primary,
    surface: colors.surface.secondary,
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[700],
      disabled: colors.neutral[400],
      inverse: colors.neutral.white,
    },
    border: colors.neutral[200],
    divider: colors.neutral[100],
  },
  dark: {
    background: colors.neutral[900],
    surface: colors.neutral[800],
    text: {
      primary: colors.neutral.white,
      secondary: colors.neutral[300],
      disabled: colors.neutral[600],
      inverse: colors.neutral[900],
    },
    border: colors.neutral[700],
    divider: colors.neutral[800],
  },
};

// === COMPONENT SPECIFIC COLORS ===
export const componentColors = {
  button: {
    primary: {
      background: colors.primary[500],
      hover: colors.primary[600],
      active: colors.primary[700],
      disabled: colors.neutral[300],
      text: colors.neutral.white,
    },
    secondary: {
      background: colors.surface.secondary,
      hover: colors.primary[50],
      active: colors.primary[100],
      disabled: colors.neutral[100],
      text: colors.primary[500],
      border: colors.primary[500],
    },
    ghost: {
      background: 'transparent',
      hover: colors.primary[50],
      active: colors.primary[100],
      text: colors.primary[500],
    },
  },
  input: {
    background: colors.neutral.white,
    border: colors.neutral[300],
    focus: colors.primary[500],
    error: colors.semantic.error.medium,
    placeholder: colors.neutral[400],
    text: colors.neutral[900],
  },
  navigation: {
    background: colors.neutral.white,
    active: colors.primary[500],
    inactive: colors.neutral[600],
    hover: colors.primary[50],
  },
  header: {
    background: colors.primary[500],
    text: colors.neutral.white,
    accent: colors.secondary[300],
  },
  card: {
    background: colors.neutral.white,
    border: colors.neutral[200],
    shadow: 'rgba(0, 0, 0, 0.1)',
    hover: colors.neutral[50],
  },
  status: {
    fresh: colors.semantic.success.medium,
    expiring: colors.semantic.warning.medium,
    expired: colors.semantic.error.medium,
    unknown: colors.neutral[400],
  },
};

// === UTILITY FUNCTIONS ===
export const colorUtils = {
  // 투명도 추가
  withOpacity: (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },

  // 그라디언트 생성
  createGradient: (color1, color2, direction = '135deg') => {
    return `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`;
  },

  // 색상 밝기 조절
  lighten: (color, amount = 0.1) => {
    // 간단한 밝기 조절 (실제 구현에서는 color manipulation 라이브러리 사용 권장)
    return color;
  },

  // 색상 어둡게 조절
  darken: (color, amount = 0.1) => {
    // 간단한 어둡기 조절 (실제 구현에서는 color manipulation 라이브러리 사용 권장)
    return color;
  },
};

// === EXPORT DEFAULT ===
export default {
  colors,
  themes,
  componentColors,
  colorUtils,
};
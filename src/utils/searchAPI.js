// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:8080';

// 검색 API 호출 함수들
export const searchAPI = {
  // 기본 검색 (추천)
  search: async (query, limit = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/api/search?query=${encodeURIComponent(query)}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`검색 실패: ${response.status}`);
    }
    
    return await response.json();
  },

  // 시멘틱 검색
  semanticSearch: async (query, searchType = 'all', limit = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/api/search/semantic?query=${encodeURIComponent(query)}&searchType=${searchType}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`시멘틱 검색 실패: ${response.status}`);
    }
    
    return await response.json();
  },

  // 벡터 검색
  vectorSearch: async (query, limit = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/api/search/vector?query=${encodeURIComponent(query)}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`벡터 검색 실패: ${response.status}`);
    }
    
    return await response.json();
  },

  // 레시피 전용 검색
  searchRecipes: async (query, limit = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/api/search/recipes?query=${encodeURIComponent(query)}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`레시피 검색 실패: ${response.status}`);
    }
    
    return await response.json();
  },

  // AI 서버 상태 확인
  checkHealth: async () => {
    const response = await fetch(`${API_BASE_URL}/api/search/health`);
    
    if (!response.ok) {
      throw new Error(`헬스체크 실패: ${response.status}`);
    }
    
    return await response.json();
  }
};

// 에러 핸들링 헬퍼
export const handleSearchError = (error) => {
  console.error('검색 오류:', error);
  
  if (error.message.includes('401')) {
    // 인증 오류
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
    return '로그인이 필요합니다.';
  }
  
  if (error.message.includes('500')) {
    return 'AI 서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.';
  }
  
  if (error.message.includes('404')) {
    return '검색 서비스를 찾을 수 없습니다.';
  }
  
  return '검색 중 오류가 발생했습니다. 다시 시도해주세요.';
};

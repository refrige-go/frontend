// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:8080';//NEXT_PUBLIC_BASE_API_URL=http://api.refrige.shop

// 커스텀 에러 클래스
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// 검색 API 호출 함수들
export const searchAPI = {
  // 기본 검색 (추천)
  search: async (query, limit = 10) => {
    try {
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
        throw new ApiError(`검색 실패`, response.status);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed in [search]:', error);
      throw error; // 에러를 다시 던져서 호출한 쪽에서도 처리할 수 있게 함
    }
  },

  // 시멘틱 검색
  semanticSearch: async (query, searchType = 'all', limit = 10) => {
    try {
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
        throw new ApiError(`시멘틱 검색 실패`, response.status);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed in [semanticSearch]:', error);
      throw error;
    }
  },

  // 벡터 검색
  vectorSearch: async (query, limit = 10) => {
    try {
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
        throw new ApiError(`벡터 검색 실패`, response.status);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed in [vectorSearch]:', error);
      throw error;
    }
  },

  // 레시피 전용 검색
  searchRecipes: async (query, limit = 10) => {
    try {
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
        throw new ApiError(`레시피 검색 실패`, response.status);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed in [searchRecipes]:', error);
      throw error;
    }
  },

  // AI 서버 상태 확인
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/search/health`);

      if (!response.ok) {
        throw new ApiError(`헬스체크 실패`, response.status);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed in [checkHealth]:', error);
      throw error;
    }
  }
};

// 에러 핸들링 헬퍼
export const handleSearchError = (error) => {
  console.error('검색 오류:', error);
  
  if (error.status === 401) {
    // 인증 오류
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
    return '로그인이 필요합니다.';
  }
  
  if (error.status === 500) {
    return 'AI 서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.';
  }
  
  if (error.status === 404) {
    return '검색 서비스를 찾을 수 없습니다.';
  }
  
  return error.message || '검색 중 오류가 발생했습니다. 다시 시도해주세요.';
};

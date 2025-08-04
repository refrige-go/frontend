'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import SearchRecipeCard from '../../components/SearchRecipeCard';
import { searchAPI, handleSearchError } from '../../utils/searchAPI';
import styles from '../../styles/pages/SearchResults.module.css';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 시멘틱 검색 실행 (레시피만)
  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setError('검색어를 입력해주세요.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 시멘틱 검색으로 레시피만 검색
      const results = await searchAPI.semanticSearch(searchQuery, 'recipe', 20);
      setSearchResults(results);
      
    } catch (err) {
      console.error('검색 오류:', err);
      setError(handleSearchError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 검색 실행
  useEffect(() => {
    if (query) {
      performSearch(query);
    } else {
      setIsLoading(false);
      setError('검색어가 없습니다.');
    }
  }, [query]);

  // 새로운 검색
  const handleNewSearch = (newQuery) => {
    router.push(`/search-results?q=${encodeURIComponent(newQuery)}`);
  };

  // 검색 결과 렌더링
  const renderSearchResults = () => {
    if (!searchResults) return null;

    const recipes = searchResults.recipes || searchResults.results || [];

    if (recipes.length === 0) {
      return (
        <div style={noResultsStyle}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3>검색 결과가 없습니다</h3>
          <p>다른 검색어를 시도해보세요.</p>
        </div>
      );
    }

    return (
      <div>
        {/* 검색 결과 요약 */}
        <div style={resultsSummaryStyle}>
          <h2>'{query}' 검색 결과</h2>
          <p>
            총 {recipes.length}개 레시피
            {searchResults.processingTime && (
              <span> (검색 시간: {searchResults.processingTime.toFixed(3)}초)</span>
            )}
          </p>
        </div>

        {/* 레시피 결과 */}
        <div style={recipeGridStyle}>
          {recipes.map((recipe, index) => (
            <SearchRecipeCard 
              key={recipe.rcpSeq || recipe.recipe_id || index}
              recipe={recipe}
              showScore={true} // 항상 점수 표시
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className='mainContainer'>
      <Header />
      
      <div className='appContainer'>
        <main style={{
            fontFamily: 'sans-serif',
            }}>
          <div className="scrollContent">
          {/* 검색바 */}
          <div style={searchBarContainerStyle}>
            <SearchBarComponent 
              initialValue={query}
              onSearch={handleNewSearch}
            />
          </div>

          {/* 로딩 상태 */}
          {isLoading && (
            <div style={loadingStyle}>
              <div style={spinnerStyle}></div>
              <p>레시피 검색 중...</p>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div style={errorStyle}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h3>검색 중 오류가 발생했습니다</h3>
              <p>{error}</p>
              <button 
                style={retryButtonStyle}
                onClick={() => performSearch(query)}
              >
                다시 시도
              </button>
            </div>
          )}

          {/* 검색 결과 */}
          {!isLoading && !error && renderSearchResults()}
        </div>
        </main>
      </div>
      
      <BottomNavigation />
    </div>
  );
}

// 간단한 검색바 컴포넌트
function SearchBarComponent({ initialValue, onSearch }) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} style={searchFormStyle}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="레시피를 검색해보세요..."
        style={searchInputStyle}
      />
      <button type="submit" style={searchButtonStyle}>
        🔍
      </button>
    </form>
  );
}

// 스타일 정의
const searchBarContainerStyle = {
  marginTop: '20px',
  marginBottom: '24px'
};

const searchFormStyle = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#f5f5f6',
  borderRadius: '10px',
  padding: '4px',
  maxWidth: '600px'
};

const searchInputStyle = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  padding: '12px 16px',
  fontSize: '16px',
  color: '#333'
};

const searchButtonStyle = {
  background: '#f79726',
  border: 'none',
  borderRadius: '8px',
  padding: '12px 16px',
  fontSize: '16px',
  cursor: 'pointer',
  color: 'white'
};

const loadingStyle = {
  textAlign: 'center',
  padding: '48px 16px',
  color: '#6c757d'
};

const spinnerStyle = {
  width: '40px',
  height: '40px',
  border: '4px solid #f3f3f3',
  borderTop: '4px solid #f79726',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '0 auto 16px'
};

const errorStyle = {
  textAlign: 'center',
  padding: '48px 16px',
  color: '#dc3545'
};

const retryButtonStyle = {
  background: '#f79726',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  cursor: 'pointer',
  marginTop: '16px'
};

const noResultsStyle = {
  textAlign: 'center',
  padding: '48px 16px',
  color: '#6c757d'
};

const resultsSummaryStyle = {
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '1px solid #dee2e6'
};

const recipeGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '20px'
};

// CSS 애니메이션 추가
const styles_text = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles_text;
  document.head.appendChild(styleSheet);
}

// src/components/SearchBar.jsx
import React from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Search", 
  onSearch,
  showSearchButton = false 
}) {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    const searchQuery = value?.trim();
    
    if (!searchQuery) {
      alert('검색어를 입력해주세요.');
      return;
    }

    // onSearch prop이 있으면 사용, 없으면 검색 결과 페이지로 이동
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/search-results?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          background: '#f5f5f6',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px',
          width: '100%',
          maxWidth: 420,
        }}
      >
        <img
          src="/images/search.svg"
          alt="검색"
          style={{
            width: 24,
            height: 24,
            marginRight: 8,
            opacity: 0.5,
          }}
        />
        <input
          type="text"
          value={value}
          onChange={onChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 16,
            color: '#888',
            width: '100%',
          }}
        />
        
        {showSearchButton && (
          <button
            type="submit"
            style={{
              background: '#f79726',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              color: 'white',
              cursor: 'pointer',
              marginLeft: '8px',
              fontSize: '14px'
            }}
          >
            검색
          </button>
        )}
      </div>
    </form>
  );
}
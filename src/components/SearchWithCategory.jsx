import React from 'react';
import SearchBar from './SearchBar';
import { useRouter } from 'next/navigation';

const defaultCategories = [
  { label: '한식', icon: '🍚' },
  { label: '양식', icon: '🍝' },
  { label: '중식', icon: '🥟' },
  { label: '일식', icon: '🍣' },
  { label: '태국식', icon: '🍜' },
  { label: '멕시코식', icon: '🌮' },
  { label: '중동식', icon: '🥙' },
  { label: '인도식', icon: '🍛' },
  { label: '스페인식', icon: '🥘' },
  { label: '다이어트식', icon: '🥗' },
  { label: '영유아식', icon: '🍼' },
  { label: '더보기', icon: '⋯' },
];

export default function SearchWithCategory({ value, onChange, placeholder = "Search", categories = defaultCategories }) {
  const router = useRouter();

  return (
    <div style={{ width: '100%' }}>
      <SearchBar
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          margin: '24px 0',
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'white',
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              padding: '24px 0 16px 0',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
              minHeight: '110px',
            }}
            onClick={() => router.push(`/category/${encodeURIComponent(cat.label)}`)}
          >
            <span style={{ fontSize: 36, marginBottom: 12 }}>{cat.icon}</span>
            <span style={{ fontSize: 16, fontWeight: 500, color: '#222' }}>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 
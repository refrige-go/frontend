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
  { label: '기타', icon: '⋯' },
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
              width: 72,
              height: 72,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'white',
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'box-shadow 0.15s, background 0.15s, transform 0.15s',
              padding: 0,
            }}
            onClick={() => router.push(`/category/${encodeURIComponent(cat.label)}`)}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(245, 158, 66, 0.18)';
              e.currentTarget.style.background = '#FFF7ED';
              e.currentTarget.style.transform = 'scale(1.07)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span style={{ fontSize: 30, marginBottom: 4 }}>{cat.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#222' }}>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 
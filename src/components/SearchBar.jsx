// src/components/SearchBar.jsx
import React from 'react';

export default function SearchBar({ value, onChange, placeholder = "Search" }) {
  return (
    <div
      style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px',
        marginTop: '24px',
        borderRadius: '8px',
        border: '1px solid var(--Neutral-neutral-50, #E9EAEB)',
        background: 'rgba(31, 42, 55, 0.05)',
        width: '100%',
        maxWidth: 420,
      }}
    >
      <img
        src="/images/search.svg"
        alt="검색"
        style={{
          width: 22,
          height: 22,
          marginRight: 8,
          opacity: 0.5,
        }}
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: '#888',
          width: '100%',
          color: '#0D1217',
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: 'normal'
        }}
      />
    </div>
  );
}
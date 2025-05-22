// src/components/SearchBar.jsx
import React from 'react';

export default function SearchBar({ value, onChange, placeholder = "Search" }) {
  return (
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
    </div>
  );
}
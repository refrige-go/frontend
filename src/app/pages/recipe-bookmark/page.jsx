"use client";

import { useState } from 'react';

export default function TestBookmarkToggle() {
  const [userId, setUserId] = useState('');
  const [recipeId, setRecipeId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleToggle = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`http://localhost:8080/api/bookmark/toggle?userId=${userId}&recipeId=${recipeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: Number(userId),
          recipeId: Number(recipeId),
        }),
      });

      if (!res.ok) {
        throw new Error('API 호출 실패');
      }

      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>찜 토글 기능 테스트</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          User ID:
          <input
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{ marginLeft: 10, width: '100%' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Recipe ID:
          <input
            type="number"
            value={recipeId}
            onChange={(e) => setRecipeId(e.target.value)}
            style={{ marginLeft: 10, width: '100%' }}
          />
        </label>
      </div>

      <button onClick={handleToggle} disabled={loading || !userId || !recipeId}>
        {loading ? '처리 중...' : '찜 토글하기'}
      </button>

      {error && <p style={{ color: 'red' }}>에러: {error}</p>}

      {result && (
        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
          <p><strong>결과:</strong></p>
          <p>찜 상태: {result.bookmarked ? '찜됨' : '해제됨'}</p>
          <p>메시지: {result.message}</p>
        </div>
      )}
    </div>
  );
}

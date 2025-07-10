'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SubPageHeader from '../../../components/layout/SubPageHeader.jsx';
import BottomNavigation from '../../../components/layout/BottomNavigation.jsx';

export default function CompletePage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    const data = sessionStorage.getItem('ocr_selected_ingredients');
    if (data) {
      try {
        setIngredients(JSON.parse(data));
      } catch (e) {
        setIngredients([]);
      }
    }
  }, []);

  return (
    <div className="mainContainer">
      <SubPageHeader title="재료 추가 완료" />
      
      <div className="appContainer" style={{ paddingTop: 76 }}>
        {/* 성공 메시지 */}
        <div style={{
          background: '#e6fff2',
          color: '#22c55e',
          borderRadius: 12,
          padding: '16px 18px',
          margin: '18px auto 24px auto',
          width: '100%',
          maxWidth: 400,
          fontSize: '1.1em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          textAlign: 'center'
        }}>
          <span style={{
            background: '#f79726',
            color: '#fff',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3em'
          }}>✓</span>
          <span>재료가 성공적으로 추가되었습니다!</span>
        </div>

        {/* 재료 목록 */}
        <div style={{
          width: '100%',
          maxWidth: 400,
          margin: '0 auto 24px auto'
        }}>
          {ingredients.map((ing, idx) => (
            <div key={idx} style={{
              background: '#fff',
              borderRadius: 14,
              marginBottom: 12,
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '2px solid #f79726'
            }}>
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <span style={{
                  fontWeight: 'bold',
                  fontSize: '1.1em',
                  color: '#222'
                }}>
                  {typeof ing.name === 'object' && ing.name !== null ? ing.name.matchedName : ing.name}
                </span>
                <div style={{
                  display: 'flex',
                  gap: 16,
                  color: '#666',
                  fontSize: '0.9em'
                }}>
                  <span>카테고리: {ing.category || '미분류'}</span>
                  <span>보관: {ing.isFrozen ? '냉동' : '냉장'}</span>
                </div>
                <div style={{
                  display: 'flex',
                  gap: 16,
                  color: '#666',
                  fontSize: '0.9em'
                }}>
                  <span>유통기한: {ing.expirationDate || '미입력'}</span>
                  <span>구매일자: {ing.purchaseDate || '미입력'}</span>
                </div>
              </div>
              <span style={{
                background: '#f79726',
                color: '#fff',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1em',
                marginLeft: 12
              }}>✓</span>
            </div>
          ))}
        </div>

        {/* 하단 버튼 */}
        <div style={{
          width: '100%',
          maxWidth: 400,
          margin: '0 auto'
        }}>
          <button 
            onClick={() => router.push('/refrigerator')}
            style={{
              width: '100%',
              background: '#f79726',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '16px 0',
              fontSize: '1.15em',
              fontWeight: 'bold',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            내 냉장고 보기
          </button>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
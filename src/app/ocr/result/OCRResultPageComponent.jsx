'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SubPageHeader from '../../../components/layout/SubPageHeader.jsx';
import BottomNavigation from '../../../components/layout/BottomNavigation.jsx';

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);
  const categoryList = [
    "과일", "채소", "육류", "수산물/해산물", "곡류/분말", "조미료/양념", "면/떡", "두류/콩류", "기타"
  ];
  const [ocrIngredients, setOcrIngredients] = useState([]);      // OCR 인식 재료
  const [manualIngredients, setManualIngredients] = useState([]); // 직접 추가 재료
  const [input, setInput] = useState('');
  const [bulkPurchaseDate, setBulkPurchaseDate] = useState('');
  const [selectedIdxs, setSelectedIdxs] = useState([]);

  // 토큰 로드
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    setToken(storedToken);
  }, []);

  // OCR 데이터 로드
  useEffect(() => {
    const data = sessionStorage.getItem('ocr_ingredients');
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        const purchaseDate = (!Array.isArray(parsedData) && parsedData.purchaseDate) 
          ? parsedData.purchaseDate 
          : '';
        const ocrList = Array.isArray(parsedData)
          ? parsedData
          : (parsedData.ingredients || []);
        const formatted = ocrList
          .map(item => ({
            name: item.matched_name || item.name || '',
            text: item.original_text || item.text || '',
            confidence: item.confidence,
            ingredient_id: item.ingredient_id || null,
            status: item.status || 
              (item.confidence === null || item.confidence === undefined
                ? 'manual'
                : item.confidence >= 0.6
                  ? 'selected'
                  : item.confidence >= 0.3
                    ? 'need_check'
                    : 'uncertain'),
            category: item.category || '기타',
            isFrozen: false,
            purchaseDate: purchaseDate,
            expirationDate: ''
          }))
        .filter(item => item.name)
        setOcrIngredients(formatted);
      } catch (e) {
        setOcrIngredients([]);
      }
    }
  }, []);

  // 구매일자 일괄 변경 함수
  const handleBulkPurchaseDateChange = (date) => {
    setBulkPurchaseDate(date);
    
    // 유통기한을 구매일자 + 7일로 계산
    const expirationDate = date ? new Date(new Date(date).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '';
    
    setManualIngredients(ings =>
      ings.map(ing => ({
        ...ing,
        purchaseDate: date,
        expirationDate: expirationDate
      }))
    );
    setOcrIngredients(ings =>
      ings.map(ing => ({
        ...ing,
        purchaseDate: date,
        expirationDate: expirationDate
      }))
    );
  };

  // 선택/해제 (개별)
  const handleSelect = (idx) => {
    setSelectedIdxs((prev) =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };
  // 전체 선택/해제
  const handleSelectAll = () => {
    setSelectedIdxs([...Array(manualIngredients.length + ocrIngredients.length).keys()]);
  };
  const handleDeselectAll = () => {
    setSelectedIdxs([]);
  };

  // 냉동여부 변경
  const handleFrozenChange = (idx, value, isManual) => {
    if (isManual) {
      setManualIngredients(ings =>
        ings.map((ing, i) =>
          i === idx ? { ...ing, isFrozen: value } : ing
        )
      );
    } else {
      const ocrIdx = idx - manualIngredients.length;
      setOcrIngredients(ings =>
        ings.map((ing, i) =>
          i === ocrIdx ? { ...ing, isFrozen: value } : ing
        )
      );
    }
  };

  // 날짜 변경
  const handleDateChange = (idx, field, value, isManual) => {
    if (isManual) {
      setManualIngredients(ings =>
        ings.map((ing, i) =>
          i === idx ? { ...ing, [field]: value } : ing
        )
      );
    } else {
      const ocrIdx = idx - manualIngredients.length;
      setOcrIngredients(ings =>
        ings.map((ing, i) =>
          i === ocrIdx ? { ...ing, [field]: value } : ing
        )
      );
    }
  };

  // 직접 추가
  const handleManualAdd = () => {
    if (!input.trim()) return;
    // 중복 방지: manual+ocr 전체에서 이미 있으면 추가 안함
    const allNames = [...manualIngredients, ...ocrIngredients].map(ing => ing.name);
    if (allNames.includes(input.trim())) {
      alert('이미 추가된 재료입니다.');
      setInput('');
      return;
    }
    
    // 새 재료 추가 시 일괄 설정된 날짜 적용
    const expirationDate = bulkPurchaseDate ? new Date(new Date(bulkPurchaseDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '';
    
    setManualIngredients([
      {
        name: input,
        confidence: null,
        status: 'manual',
        text: input,
        category: '기타',
        isFrozen: false,
        purchaseDate: bulkPurchaseDate,
        expirationDate: expirationDate
      },
      ...manualIngredients
    ]);
    setInput('');
  };

  // 저장 함수
  const saveIngredients = async (ingredients) => {
    try {
      if (!token) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      const baseUrl= process.env.NEXT_PUBLIC_BASE_API_URL;
      const response = await fetch(`${baseUrl}/api/ocr/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ingredients)
      });

      if (!response.ok) {
        throw new Error('저장 실패');
      }

      if (response.status === 204) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('재료 저장 중 오류:', error);
      throw error;
    }
  };

  // 선택된 재료만 complete로
  const handleAddSelected = async () => {
    const allIngredients = [...manualIngredients, ...ocrIngredients];
    const selected = allIngredients
      .filter((ing, idx) => selectedIdxs.includes(idx))
      .map(ing => ({
        name: typeof ing.name === 'object' ? ing.name.matchedName : ing.name,
        category: ing.category || (ing.name?.mainCategory || '미분류'),
        isFrozen: ing.isFrozen,
        purchaseDate: ing.purchaseDate,
        expirationDate: ing.expirationDate,
        storageMethod: ing.isFrozen ? '냉동' : '냉장',
        ingredient_id: ing.ingredient_id || ing.id || ing.matched_id || null
      }));

    if (selected.length === 0) {
      alert('최소 1개 이상의 재료를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await saveIngredients(selected);
      sessionStorage.setItem('ocr_selected_ingredients', JSON.stringify(selected));
      router.push('/ocr/complete');
    } catch (error) {
      alert('재료 저장 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
    // 카드 스타일
  const getCardStyle = status => {
    if (status === 'selected') return { border: '1.5px solid #f79726', background: '#e6fff2' };
    if (status === 'need_check') return { border: '1.5px solid #f79726', background: '#fff' };
    if (status === 'uncertain') return { border: '1.5px solid #f79726', background: '#fff' };
    if (status === 'manual') return { border: '1.5px solid #b3c6e0', background: '#f3f6fa' };
    return {};
  };

  return (
    <div className="mainContainer">
      <SubPageHeader title="인식 결과 확인" />
      <div className="appContainer" style={{ paddingTop: 76 }}>
        {/* 기존 .header, .summary, .manual-add-row, .ingredient-list 등 모든 내용 이곳에 배치 */}
        <div style={{ background: '#e6fff2', color: '#22c55e', borderRadius: 12, padding: '12px 18px', margin: '0 auto 18px auto', width: '100%', maxWidth: 400, fontSize: '1.1em', textAlign: 'center', fontWeight: 500 }}>
          <span role="img" aria-label="축하">🎉</span>
          <b>총 {[...manualIngredients, ...ocrIngredients].filter((_, idx) => selectedIdxs.includes(idx)).length}개의 재료를 선택했어요!</b><br />
          <span style={{ color: '#333', fontWeight: 400 }}>확인하시고 냉장고에 추가해보세요</span>
        </div>

        {/* 일괄 날짜 설정 섹션 */}
        <div style={{ width: '100%', maxWidth: 400, margin: '0 auto 18px auto', background: '#f8f9fa', borderRadius: 12, padding: '16px', border: '1px solid #e9ecef' }}>
          <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: 10, color: '#333' }}>일괄 날짜 설정</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '14px', color: '#666', minWidth: '70px' }}>구매일자</span>
            <input
              type="date"
              value={bulkPurchaseDate}
              onChange={e => handleBulkPurchaseDateChange(e.target.value)}
              style={{ 
                flex: 1, 
                border: '1px solid #d1d5db', 
                borderRadius: 8, 
                padding: '8px 12px', 
                fontSize: '14px', 
                background: '#fff' 
              }}
            />
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: 8 }}>
            💡 구매일자를 설정하면 모든 재료의 구매일자와 유통기한(+1주일)이 자동으로 설정됩니다
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: 400, margin: '0 auto 10px auto', fontSize: '15px', color: '#333', textAlign: 'left', fontWeight: 500 }}>
          추가할 재료를 선택하세요
        </div>
        <div style={{ width: '100%', maxWidth: 400, margin: '0 auto 14px auto', display: 'flex', gap: 8 }}>
          <button onClick={handleSelectAll} style={{ flex: 1, background: '#f79726', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 0', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>전체 선택</button>
          <button onClick={handleDeselectAll} style={{ flex: 1, background: '#e5e7eb', color: '#333', border: 'none', borderRadius: 8, padding: '8px 0', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>전체 해제</button>
        </div>
        <div className="manual-add-row" style={{ width: '100%', maxWidth: 400, margin: '0 auto 18px auto', display: 'flex', gap: 8 }}>
          <input
            className="manual-input"
            placeholder="재료명을 입력하세요"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleManualAdd()}
            style={{ flex: 1, border: '1.5px solid #f79726', borderRadius: 8, padding: '10px', fontSize: '15px', marginRight: 0 }}
          />
          <button className="manual-btn" onClick={handleManualAdd} style={{ background: '#f79726', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: '15px', cursor: 'pointer' }}>추가</button>
        </div>
        <div className="ingredient-list" style={{ width: '100%', maxWidth: 400, margin: '0 auto 18px auto' }}>
          {[...manualIngredients, ...ocrIngredients].map((ing, idx) => {
            const isManual = idx < manualIngredients.length;
            const isSelected = selectedIdxs.includes(idx);
            return (
              <div
                key={idx}
                className="ingredient-item"
                style={{
                  border: isSelected ? '2px solid #f79726' : '1.5px solid #e5e7eb',
                  background: isSelected ? '#fff8f0' : '#f9fafb',
                  borderRadius: 16,
                  marginBottom: 22,
                  padding: '20px 18px 18px 18px',
                  boxShadow: isSelected ? '0 4px 16px rgba(245,151,38,0.08)' : '0 2px 8px rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  minHeight: 120,
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelect(idx)}
                    style={{ width: 22, height: 22, accentColor: '#f79726', marginRight: 6, cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: 700, fontSize: '18px', color: '#222', letterSpacing: '-0.5px', flex: 1 }}>{typeof ing.name === 'object' && ing.name !== null ? ing.name.matchedName : ing.name}</span>
                  <span style={{ fontSize: '13px', color: '#888', fontWeight: 500, marginLeft: 2 }}>{ing.status === 'manual' ? '직접 입력' : '영수증 인식됨'}</span>
                </div>
                {ing.status !== 'manual' && (
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: 6, lineHeight: 1.4 }}>
                    인식된 텍스트: <span style={{ color: '#666' }}>&quot;{typeof ing.text === 'object' && ing.text !== null ? ing.text.originalName : ing.text}&quot;</span>
                  </div>
                )}
                {isSelected && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: '13px', color: '#888', fontWeight: 500 }}>카테고리</span>
                        <select
                          value={ing.category}
                          onChange={e => {
                            const newCategory = e.target.value;
                            if (isManual) {
                              setManualIngredients(ings =>
                                ings.map((item, i) =>
                                  i === idx ? { ...item, category: newCategory } : item
                                )
                              );
                            } else {
                              const ocrIdx = idx - manualIngredients.length;
                              setOcrIngredients(ings =>
                                ings.map((item, i) =>
                                  i === ocrIdx ? { ...item, category: newCategory } : item
                                )
                              );
                            }
                          }}
                          style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 10px', fontSize: '13px', background: '#fff', minWidth: 70 }}
                        >
                          {categoryList.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      {/* 보관 방식 토글 버튼 - 항상 오른쪽 고정 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px' }}>
                        <span style={{ color: '#888', fontWeight: 500 }}>보관 방식</span>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: 16, padding: '1px' }}>
                          <button
                            onClick={() => handleFrozenChange(idx, false, isManual)}
                            style={{
                              padding: '4px 10px',
                              fontSize: '11px',
                              fontWeight: 600,
                              border: 'none',
                              borderRadius: '15px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              background: !ing.isFrozen ? '#f79726' : 'transparent',
                              color: !ing.isFrozen ? '#fff' : '#666'
                            }}
                          >
                            냉장
                          </button>
                          <button
                            onClick={() => handleFrozenChange(idx, true, isManual)}
                            style={{
                              padding: '4px 10px',
                              fontSize: '11px',
                              fontWeight: 600,
                              border: 'none',
                              borderRadius: '15px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              background: ing.isFrozen ? '#f79726' : 'transparent',
                              color: ing.isFrozen ? '#fff' : '#666'
                            }}
                          >
                            냉동
                          </button>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: '12px', color: '#aaa', marginBottom: 1 }}>구매일자</span>
                        <input
                          type="date"
                          value={ing.purchaseDate || ''}
                          onChange={e => handleDateChange(idx, 'purchaseDate', e.target.value, isManual)}
                          style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', fontSize: '13px', background: '#fff', minWidth: 110 }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: '12px', color: '#aaa', marginBottom: 1 }}>유통기한</span>
                        <input
                          type="date"
                          value={ing.expirationDate || ''}
                          onChange={e => handleDateChange(idx, 'expirationDate', e.target.value, isManual)}
                          style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', fontSize: '13px', background: '#fff', minWidth: 110 }}
                        />
                      </div>
                    </div>
                  </>
                )}

              </div>
            );
          })}
        </div>
        <div className="add-btn-row" style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
          <button className="add-btn-main" onClick={handleAddSelected} disabled={isLoading || selectedIdxs.length === 0} style={{ width: '100%', background: '#f79726', color: '#fff', border: 'none', borderRadius: 12, padding: '16px 0', fontSize: '1.1em', fontWeight: 600, marginTop: 8, cursor: selectedIdxs.length === 0 ? 'not-allowed' : 'pointer', opacity: selectedIdxs.length === 0 ? 0.6 : 1 }}>
            {isLoading ? '저장 중...' : '선택한 재료 냉장고에 추가하기'}
          </button>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
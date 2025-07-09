'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    setManualIngredients(ings =>
      ings.map(ing => ({
        ...ing,
        purchaseDate: date
      }))
    );
    setOcrIngredients(ings =>
      ings.map(ing => ({
        ...ing,
        purchaseDate: date
      }))
    );
  };

  // 선택/해제
  const handleToggle = (idx, isManual) => {
    if (isManual) {
      setManualIngredients(ings =>
        ings.map((ing, i) => {
          if (i !== idx) return ing;
          if (ing.status === 'manual') return { ...ing, status: 'need_check' };
          if (ing.status === 'need_check' && ing.confidence === null) return { ...ing, status: 'manual' };
          return ing;
        })
      );
    } else {
      setOcrIngredients(ings =>
        ings.map((ing, i) => {
          if (i !== idx) return ing;
          if (ing.status === 'selected') return { ...ing, status: 'need_check' };
          if (ing.status === 'need_check' && ing.confidence !== null) return { ...ing, status: 'selected' };
          return ing;
        })
      );
    }
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
      setOcrIngredients(ings =>
        ings.map((ing, i) =>
          i === idx ? { ...ing, isFrozen: value } : ing
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
      setOcrIngredients(ings =>
        ings.map((ing, i) =>
          i === idx ? { ...ing, [field]: value } : ing
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
    setManualIngredients([
      {
        name: input,
        confidence: null,
        status: 'manual',
        text: input,
        category: categoryList[0],
        isFrozen: false,
        purchaseDate: '',
        expirationDate: ''
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
      .filter(ing => ing.status === 'selected' || ing.status === 'manual')
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

  // 선택 버튼
  const getBtn = (status, idx, isManual) => (
    <button
      className={`btn-${status}`}
      onClick={() => handleToggle(idx, isManual)}
      style={{
        background: status === 'selected' || status === 'manual' ? '#f79726' : '#e0e0e0',
        color: '#000',
        border: 'none',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        fontSize: '1.1em',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {status === 'selected' || status === 'manual' ? '✓' : ''}
    </button>
  );

  return (
    <div className="container">
      <style jsx>{`
        .container { background: #f7faff; min-height: 100vh; padding: 0 0 32px 0; }
        .header { background: #f79726; color: #fff; font-weight: bold; font-size: 1.3em; text-align: center; border-radius: 0 0 18px 18px; padding: 18px 0 14px 0; margin-bottom: 18px; }
        .summary { background: #e6fff2; color: #22c55e; border-radius: 12px; padding: 12px 18px; margin: 0 auto 18px auto; width: 92vw; max-width: 400px; font-size: 1.1em; }
        .summary b { color: #22c55e; }
        .list-title { font-weight: bold; font-size: 1.1em; margin: 0 0 10px 0; }
        .ingredient-list { width: 92vw; max-width: 400px; margin: 0 auto 18px auto; }
        .ingredient-item { border-radius: 14px; margin-bottom: 12px; padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px #0001; }
        .ingredient-info { flex: 1; }
        .ingredient-name { font-weight: bold; font-size: 1.1em; }
        .ingredient-status { font-size: 0.95em; margin: 2px 0 4px 0; }
        .ingredient-category {font-size: 0.92em;color: #888;display: flex;align-items: center;min-height: 32px;gap: 8px;}
        .category-select-area {min-width: 170px;max-width: 200px;display: flex;align-items: center;}
        .ingredient-category select { min-width: 100px;max-width: 120px;}
        .ingredient-dates { font-size: 0.92em; color: #888; margin-top: 6px; display: flex; gap: 16px; }
        .btn-selected, .btn-add, .btn-uncertain, .btn-manual { border: none; border-radius: 50%; width: 36px; height: 36px; font-size: 1.1em; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .btn-add { background: #ffd966; color: #f79726; }
        .btn-uncertain { background: #ff7b7b; color: #fff; }
        .btn-manual { background: #ffd966; color: #f79726; }
        .btn-selected { background: #ffd966; color: #f79726; }
        .manual-add-row { display: flex; align-items: center; width: 92vw; max-width: 400px; margin: 0 auto 18px auto; }
        .manual-input { flex: 1; border: 1.5px solid #f79726; border-radius: 8px; padding: 10px; font-size: 1em; margin-right: 8px; }
        .manual-btn { background: #f79726; color: #fff; border: none; border-radius: 8px; padding: 10px 18px; font-weight: bold; font-size: 1em; cursor: pointer; }
        .add-btn-row { width: 92vw; max-width: 400px; margin: 0 auto; }
        .add-btn-main { width: 100%; background: #f79726; color: #fff; border: none; border-radius: 12px; padding: 16px 0; font-size: 1.15em; font-weight: bold; margin-top: 8px; cursor: pointer; }
        .frozen-radio { margin-left: 12px; white-space: nowrap;}
        .frozen-radio label { margin-right: 8px; white-space: nowrap;}
        .ingredient-dates input[type="date"] { margin-left: 4px; }
      `}</style>

      <div className="header">인식된 재료 확인</div>
      <div className="summary">
        <span role="img" aria-label="축하">🎉</span> 
        <b>총 {[...manualIngredients, ...ocrIngredients].filter(ing => ing.status === 'selected' || ing.status === 'manual').length}개의 재료를 찾았어요!</b><br />
        확인하시고 냉장고에 추가해보세요
      </div>

      {/* 구매일자 일괄 변경 입력창 */}
      <div style={{ width: '92vw', maxWidth: 400, margin: '0 auto 18px auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 'bold' }}>구매일자 일괄 변경:</span>
        <input
          type="date"
          value={bulkPurchaseDate}
          onChange={e => handleBulkPurchaseDateChange(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: 6, border: '1.2px solid #f79726' }}
        />
      </div>

      {/* 입력창 */}
      <div className="manual-add-row">
        <input
          className="manual-input"
          placeholder="재료명을 입력하세요"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleManualAdd()}
        />
        <button className="manual-btn" onClick={handleManualAdd}>추가</button>
      </div>

      {/* 재료 리스트 */}
      <div className="ingredient-list">
        <div className="list-title">인식된 재료</div>
        {[...manualIngredients, ...ocrIngredients].map((ing, idx) => {
          const isManual = idx < manualIngredients.length;
          return (
            <div key={idx} className="ingredient-item" style={getCardStyle(ing.status)}>
              <div className="ingredient-info">
                <div className="ingredient-name">{typeof ing.name === 'object' && ing.name !== null ? ing.name.matchedName : ing.name}</div>
                <div className="ingredient-status">
                  {ing.status === 'selected' && <>자동 선택됨</>}
                  {ing.status === 'need_check' && <><span style={{color:'#f79726'}}>확인 필요</span></>}
                  {ing.status === 'uncertain' && <><span style={{color:'#ff7b7b'}}>불확실</span></>}
                  {ing.status === 'manual' && <>직접 추가</>}
                </div>
                <div className="ingredient-status" style={{color:'#888'}}>인식된 텍스트: "{typeof ing.text === 'object' && ing.text !== null ? ing.text.originalName : ing.text}"</div>
                <div className="ingredient-category">
                  <div className="category-select-area">
                    {ing.status === 'manual' ? (
                      <>
                        <span style={{marginRight: 4}}>카테고리:</span>
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
                              setOcrIngredients(ings =>
                                ings.map((item, i) =>
                                  i === idx - manualIngredients.length ? { ...item, category: newCategory } : item
                                )
                              );
                            }
                          }}
                        >
                          {categoryList.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <>카테고리: {ing.category || '기타'}</>
                    )}
                  </div>
                  <span className="frozen-radio">
                    냉동여부: 
                    <label>
                      <input
                        type="radio"
                        name={`isFrozen-${idx}`}
                        checked={ing.isFrozen === true}
                        onChange={() => handleFrozenChange(idx, true, isManual)}
                      /> O
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`isFrozen-${idx}`}
                        checked={ing.isFrozen === false}
                        onChange={() => handleFrozenChange(idx, false, isManual)}
                      /> X
                    </label>
                  </span>
                </div>
                <div className="ingredient-dates">
                  <span style={{whiteSpace: 'nowrap'}}>
                    구매일자: 
                    <input
                      type="date"
                      value={ing.purchaseDate || ''}
                      onChange={e => handleDateChange(idx, 'purchaseDate', e.target.value, isManual)}
                    />
                  </span>
                </div>
              </div>
              {getBtn(ing.status, idx, isManual)}
            </div>
          );
        })}
      </div>

      {/* 저장 버튼 */}
      <div className="add-btn-row">
        <button 
          className="add-btn-main" 
          onClick={handleAddSelected} 
          disabled={isLoading}
        >
          {isLoading ? '저장 중...' : '선택된 재료 추가하기'}
        </button>
      </div>
    </div>
  );
}
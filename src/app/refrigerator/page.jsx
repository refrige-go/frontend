'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIngredients } from '../../hooks/useIngredients';
import api, { apiUtils, authUtils } from '../../lib/api';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import styles from '../../styles/pages/Refrigerator.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';

export default function RefrigeratorPage() {
  const router = useRouter();
  const { 
    ingredients, 
    loading, 
    error, 
    deleteIngredient, 
    updateFrozenStatus, 
    updateDates, 
    refetchIngredients,
    clearError 
  } = useIngredients();
  
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isRecommendLoading, setIsRecommendLoading] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [isFrozenToggle, setIsFrozenToggle] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [activeTab, setActiveTab] = useState('stock');
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [modalSelectedIngredientIds, setModalSelectedIngredientIds] = useState([]);
  const [isRecommending, setIsRecommending] = useState(false);

  const baseURL = process.env.NEXT_PUBLIC_BASE_API_URL;

  // 에러 표시 처리
  useEffect(() => {
    if (error) {
      alert(error);
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    if (selectedIngredient) {
      setIsFrozenToggle(!!selectedIngredient.frozen);
      setPurchaseDate(selectedIngredient.purchaseDate ? new Date(selectedIngredient.purchaseDate) : null);
      setExpiryDate(selectedIngredient.expiryDate ? new Date(selectedIngredient.expiryDate) : null);
    }
  }, [selectedIngredient]);

  const handleDelete = async (id) => {
    const confirmed = confirm('정말 삭제하시겠습니까?');
    if (!confirmed) return;
    
    const success = await deleteIngredient(id);
    if (success) {
      alert('재료가 삭제되었습니다.');
      if (selectedIngredient?.id === id) {
        setSelectedIngredient(null);
      }
    } else {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleComplete = async () => {
    try {
      let success = true;
      
      // 냉동 상태가 변경된 경우
      if (selectedIngredient.frozen !== isFrozenToggle) {
        success = await updateFrozenStatus(selectedIngredient.id, isFrozenToggle);
        if (!success) {
          alert('냉동 보관 상태 저장 실패!');
          return;
        }
      }
      
      // 날짜 업데이트
      success = await updateDates(selectedIngredient.id, purchaseDate, expiryDate);
      if (!success) {
        alert('날짜 저장 실패!');
        return;
      }
      
      alert('변경사항이 저장되었습니다.');
      setSelectedIngredient(null);
      
    } catch (e) {
      console.error('저장 실패:', e);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleModalIngredientSelect = (id) => {
    setModalSelectedIngredientIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

const handleModalRecommend = async () => {
  try {
    // 로딩 상태가 있다면 활성화, 없다면 생략
    if (typeof setIsRecommendLoading === 'function') {
      setIsRecommendLoading(true);
    }

    const selectedIngredientNames = ingredients
      .filter(ingredient => modalSelectedIngredientIds.includes(ingredient.id))
      .map(ingredient => ingredient.name);
    
    // 요청 데이터 구성
    const requestData = {
      userId: null, // 또는 'guest-user'
      selectedIngredients: selectedIngredientNames,
      limit: 10
    };

    console.log('추천 요청 데이터:', requestData);

    // API 호출
    const response = await fetch(`${baseURL}/api/recommendations/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    console.log('응답 상태:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('서버 오류:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('추천 결과:', data);
    
    // 추천 결과 처리
    if (data && data.recommendedRecipes) {
      const recipes = data.recommendedRecipes.map(r => ({
        ...r,
        name: r.recipeName
      }));
      setRecommendedRecipes(recipes);
      setShowRecommendations(true);
      
      // 추천 레시피를 로컬 스토리지에 저장
      localStorage.setItem('recommendedRecipes', JSON.stringify(recipes));
      
      // 모달 닫기
      setShowRecommendModal(false);
      
      alert(`${recipes.length}개의 레시피를 추천받았습니다!`);
      
      // 레시피 페이지로 이동
      router.push('/recipes');
    } else {
      alert('추천할 레시피가 없습니다. 다른 재료를 선택해보세요.');
    }
    
  } catch (error) {
    console.error('추천 오류:', error);
    alert('레시피 추천에 실패했습니다. 다시 시도해주세요.');
  } finally {
    // 로딩 상태가 있다면 비활성화
    if (typeof setIsRecommendLoading === 'function') {
      setIsRecommendLoading(false);
    }
  }
};

  const filteredIngredients = ingredients.filter((item) =>
    activeTab === 'expired'
      ? item.expiryDaysLeft !== null && item.expiryDaysLeft < 0
      : item.expiryDaysLeft === null || item.expiryDaysLeft >= 0
  );

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="mainContainer">
        <Header />
        <div className="appContainer">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh',
            fontSize: '18px'
          }}>
            재료 목록을 불러오는 중...
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="mainContainer">
      <Header />
      <div className="appContainer">
        <div className={styles.tabWrap}>
          <button
            className={activeTab === 'stock' ? styles.tabActive : styles.tabInactive}
            onClick={() => setActiveTab('stock')}
          >
            냉장고 재고
          </button>
          <button
            className={activeTab === 'expired' ? styles.tabActive : styles.tabInactive}
            onClick={() => setActiveTab('expired')}
          >
            유통기한 초과
          </button>
        </div>

        <div className={styles.scrollArea}>
          <div className={styles.grid}>
            {filteredIngredients.length > 0 ? (
              filteredIngredients.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.card} ${item.frozen ? styles.frozenCard : ''}`}
                  onClick={() => setSelectedIngredient(item)}
                  style={{ position: 'relative' }}
                >
                  <button
                    className={styles.top}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                  >✕</button>
                  <div className={styles.cardContent}>
                    <img src={item.imageUrl || '/images/default.jpg'} alt={item.name} className={styles.image} />
                    <div className={styles.textContent}>
                      <div className={styles.category}>
                        {item.category || '분류 없음'}
                        {item.frozen && <span className={styles.frozenIcon}>❄️</span>}
                      </div>
                      <div className={styles.nameDday}>
                        <span className={styles.name}>{item.name}</span>
                        {item.expiryDaysLeft !== null && item.expiryDaysLeft >= 0 && (
                          <span className={styles.dDay}>D-{item.expiryDaysLeft}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem 1rem',
                color: '#666',
                gridColumn: '1 / -1'
              }}>
                <h3>
                  {activeTab === 'expired' ? '유통기한이 지난 재료가 없습니다' : '등록된 재료가 없습니다'}
                </h3>
                <p>재료를 추가해보세요!</p>
              </div>
            )}
          </div>
        </div>

        {selectedIngredient && (
          <div className={styles.overlay} onClick={() => setSelectedIngredient(null)}>
            <div className={styles.detailContainer} onClick={(e) => e.stopPropagation()}>
              <div className={styles.detailHeader}>
                <img src={selectedIngredient.imageUrl || '/images/default.jpg'} alt={selectedIngredient.name} />
                <div className={styles.detailInfo}>
                  <div className={styles.category}>{selectedIngredient.category}</div>
                  <div className={styles.name}>{selectedIngredient.name}</div>
                </div>
                <div className={`${styles.dDay} ${styles.detailDday} ${isFrozenToggle ? styles.frozenText : ''}`}>
                  {isFrozenToggle
                    ? '❄️ 냉동'
                    : selectedIngredient.expiryDaysLeft !== null
                      ? `D-${selectedIngredient.expiryDaysLeft}`
                      : '기한 없음'}
                </div>
              </div>

              <div className={styles.detailBody}>
                <div>
                  <span>구매일자</span>
                  <DatePicker
                    selected={purchaseDate}
                    onChange={(date) => setPurchaseDate(date)}
                    dateFormat="yyyy년 MM월 dd일"
                    locale={ko}
                    withPortal
                    portalId="root-portal"
                    className={styles.dateInput}
                  />
                </div>
                <div>
                  <span>소비기한</span>
                  <DatePicker
                    selected={expiryDate}
                    onChange={(date) => setExpiryDate(date)}
                    dateFormat="yyyy년 MM월 dd일"
                    locale={ko}
                    withPortal
                    portalId="root-portal"
                    className={styles.dateInput}
                    disabled={isFrozenToggle}
                  />
                </div>

                <div className={styles.toggleWrap}>
                  <span>냉동실 보관</span>
                  <label className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={isFrozenToggle}
                      onChange={(e) => setIsFrozenToggle(e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>

              <div className={styles.detailFooter}>
                <button className={styles.deleteBtn} onClick={() => handleDelete(selectedIngredient.id)}>재료 삭제</button>
                <button className={styles.completeBtn} onClick={handleComplete}>완료하기</button>
              </div>
            </div>
          </div>
        )}

        <button
          className={styles.recipeRecommendBtn}
          onClick={() => {
            setShowRecommendModal(true);
            setModalSelectedIngredientIds([]);
          }}
          disabled={ingredients.length === 0}
          style={{
            opacity: ingredients.length === 0 ? 0.5 : 1,
            cursor: ingredients.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          ✨레시피 추천받기
        </button>

        {showRecommendModal && (
          <div style={{
            position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.3)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 24,
              padding: '2rem 1.5rem 1.5rem 1.5rem',
              minWidth: 320,
              maxWidth: 380,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
            }}>
              <h2 style={{ marginBottom: 20, fontWeight: 700, fontSize: 22, color: '#ff6600' }}>
                재료 선택 (최소 2개)
              </h2>
              <div style={{ maxHeight: 320, overflowY: 'auto', marginBottom: 24, width: '100%' }}>
                {ingredients.length > 0 ? (
                  ingredients.map((item) => (
                    <label key={item.id} style={{
                      display: 'flex', alignItems: 'center',
                      marginBottom: 14, fontSize: 17, fontWeight: 500, cursor: 'pointer',
                      padding: '0.5rem 0.5rem 0.5rem 0', borderRadius: 8,
                      transition: 'background 0.2s',
                      background: modalSelectedIngredientIds.includes(item.id) ? '#fff6ee' : 'transparent',
                    }}>
                      <span style={{
                        display: 'inline-block',
                        width: 24, height: 24,
                        border: '2px solid #ff6600',
                        borderRadius: '50%',
                        marginRight: 14,
                        background: modalSelectedIngredientIds.includes(item.id) ? '#ff6600' : '#fff',
                        position: 'relative',
                        transition: 'background 0.2s',
                      }}>
                        <input
                          type="checkbox"
                          checked={modalSelectedIngredientIds.includes(item.id)}
                          onChange={() => handleModalIngredientSelect(item.id)}
                          style={{
                            opacity: 0,
                            width: 24,
                            height: 24,
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            margin: 0,
                            cursor: 'pointer',
                          }}
                        />
                        {modalSelectedIngredientIds.includes(item.id) && (
                          <svg width="16" height="16" viewBox="0 0 16 16" style={{ position: 'absolute', left: 4, top: 4 }}>
                            <polyline points="2,9 7,13 14,4" style={{ fill: 'none', stroke: '#fff', strokeWidth: 2 }} />
                          </svg>
                        )}
                      </span>
                      <span>{item.name}</span>
                    </label>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: '#666', margin: '2rem 0' }}>
                    선택할 재료가 없습니다.<br />
                    먼저 재료를 추가해주세요.
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
                <button 
                  onClick={() => setShowRecommendModal(false)} 
                  disabled={isRecommending}
                  style={{
                    padding: '0.6rem 1.2rem',
                    background: '#fff',
                    color: '#ff6600',
                    border: '1.5px solid #ff6600',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: isRecommending ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s, color 0.2s',
                    opacity: isRecommending ? 0.5 : 1,
                  }}
                >
                  닫기
                </button>
                <button 
                  onClick={handleModalRecommend} 
                  disabled={isRecommending || modalSelectedIngredientIds.length < 2}
                  style={{
                    padding: '0.6rem 1.2rem',
                    background: (isRecommending || modalSelectedIngredientIds.length < 2) ? '#ccc' : '#ff6600',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: (isRecommending || modalSelectedIngredientIds.length < 2) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(255,102,0,0.08)',
                    transition: 'background 0.2s',
                  }}
                >
                  {isRecommending ? '추천 중...' : `추천받기 (${modalSelectedIngredientIds.length}개 선택)`}
                </button>
              </div>
            </div>
          </div>
        )}

        <button className={styles.addButton}>＋</button>
      </div>
      <BottomNavigation />
    </div>
  );
}
// src/app/refrigerator/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useIngredients } from '../../hooks/useIngredients';
import api from '../../lib/api';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import styles from '../../styles/pages/Refrigerator.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import axios from 'axios';

export default function RefrigeratorPage() {
  const { ingredients, deleteIngredient, refetchIngredients } = useIngredients();
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [isFrozenToggle, setIsFrozenToggle] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [activeTab, setActiveTab] = useState('stock');
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [modalSelectedIngredientIds, setModalSelectedIngredientIds] = useState([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);

  useEffect(() => {
    if (selectedIngredient) {
      setIsFrozenToggle(!!selectedIngredient.frozen);
      setPurchaseDate(selectedIngredient.purchaseDate ? new Date(selectedIngredient.purchaseDate) : null);
      setExpiryDate(selectedIngredient.expiryDate ? new Date(selectedIngredient.expiryDate) : null);
    }
  }, [selectedIngredient]);

  const updateFrozenStatus = async (id, isFrozen) => {
    try {
      await api.patch(`/user-ingredients/${id}/frozen`, { frozen: isFrozen });
    } catch {
      alert('냉동 보관 상태 저장 실패!');
    }
  };

  const updateDates = async (id) => {
    try {
      await api.patch(`/user-ingredients/${id}/dates`, {
        purchaseDate: purchaseDate?.toISOString().split('T')[0],
        expiryDate: expiryDate?.toISOString().split('T')[0],
      });
    } catch {
      alert('날짜 저장 실패!');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = confirm('정말 삭제하시겠습니까?');
    if (!confirmed) return;
    const success = await deleteIngredient(id);
    if (success && selectedIngredient?.id === id) setSelectedIngredient(null);
  };

  const handleComplete = async () => {
    try {
      if (selectedIngredient.frozen !== isFrozenToggle) {
        await updateFrozenStatus(selectedIngredient.id, isFrozenToggle);
      }
      await updateDates(selectedIngredient.id);
      await refetchIngredients();
    } catch (e) {
      console.error('저장 실패:', e);
    }
    setSelectedIngredient(null);
  };

  const handleModalIngredientSelect = (id) => {
    setModalSelectedIngredientIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleModalRecommend = async () => {
    if (modalSelectedIngredientIds.length === 0) {
      alert('추천받을 재료를 선택하세요.');
      return;
    }
    try {
      const res = await axios.post('http://localhost:8080/recipes/recommend', {
        ingredientIds: modalSelectedIngredientIds,
      });
      setRecommendedRecipes(res.data);
      setShowRecommendModal(false);
    } catch (err) {
      alert('레시피 추천 실패');
    }
  };

  const filteredIngredients = ingredients.filter((item) =>
    activeTab === 'expired'
      ? item.expiryDaysLeft !== null && item.expiryDaysLeft < 0
      : item.expiryDaysLeft === null || item.expiryDaysLeft >= 0
  );

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
            {filteredIngredients.map((item) => (
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
            ))}
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
              <h2 style={{ marginBottom: 20, fontWeight: 700, fontSize: 22, color: '#ff6600' }}>재료 선택</h2>
              <div style={{ maxHeight: 320, overflowY: 'auto', marginBottom: 24, width: '100%' }}>
                {ingredients.map((item) => (
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
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
                <button onClick={() => setShowRecommendModal(false)} style={{
                  padding: '0.6rem 1.2rem',
                  background: '#fff',
                  color: '#ff6600',
                  border: '1.5px solid #ff6600',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                }}>닫기</button>
                <button onClick={handleModalRecommend} style={{
                  padding: '0.6rem 1.2rem',
                  background: '#ff6600',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(255,102,0,0.08)',
                  transition: 'background 0.2s',
                }}>추천받기</button>
              </div>
            </div>
          </div>
        )}
        {recommendedRecipes.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h2>🍳 추천 레시피</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {recommendedRecipes.map((recipe) => (
                <li
                  key={recipe.id}
                  style={{
                    border: '1px solid #ffa500',
                    borderRadius: '4px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    background: '#fff8f0',
                  }}
                >
                  <strong>{recipe.name}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button className={styles.addButton}>＋</button>
      </div>
      <BottomNavigation />
    </div>
  );
}

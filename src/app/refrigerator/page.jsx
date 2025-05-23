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
import { useRouter } from 'next/navigation';

export default function RefrigeratorPage() {
  const { ingredients, deleteIngredient, refetchIngredients } = useIngredients();
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [isFrozenToggle, setIsFrozenToggle] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [activeTab, setActiveTab] = useState('stock');
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showIngredientList, setShowIngredientList] = useState(false);
  const router = useRouter();

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

         {/* 옵션 버튼들 */}
        {showAddOptions && (
          <div className={styles.addOptionsFix}>
         <button className={styles.addOptionBtn} 
         onClick={() => router.push('/ingredients-select')}> 재료 추가 </button>
            <button className={styles.addOptionBtn} onClick={() => alert('OCR 자동 인식 클릭됨')}>OCR 자동 인식</button>
          </div>
        )}

        {/* 레시피 추천 + +버튼 */}
        <button className={styles.recipeRecommendBtn}>✨레시피 추천받기</button>
        <button className={styles.addButton} onClick={() => setShowAddOptions(!showAddOptions)}>＋</button>

      </div>
      <BottomNavigation />
    </div>
  );
}

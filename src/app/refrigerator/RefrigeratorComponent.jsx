'use client';

import { useState, useEffect } from 'react';
import { useIngredients } from '../../hooks/useIngredients';
import api from '../../lib/api';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import styles from '../../styles/pages/refrigerator.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

// JWT에서 payload(username) 파싱 함수
function getPayloadFromToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// 카테고리별 이모지 매핑
const categoryEmojiMap = {
  '곡류/분말': '🌾',
  '육류': '🥩',
  '수산물/해산물': '🐟',
  '채소': '🥬',
  '과일': '🍎',
  '버섯': '🍄',
  '유제품': '🧀',
  '두류/콩류': '🌰',
  '조미료/양념': '🧂',
  '기름/유지': '🛢️',
  '면/떡': '🍜',
  '가공식품': '🥫',
  '장아찌/절임': '🥒',
  '기타': '📦'
};

export default function RefrigeratorComponent() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (!storedToken) {
      alert('로그인 후 이용 가능합니다.');
      router.replace('/login');
      return;
    }

    api.get(`${baseUrl}/secure/ping`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then(() => {
        setToken(storedToken);
        const payload = getPayloadFromToken(storedToken);
        setUsername(payload?.username);
      })
      .catch(() => {
        alert('세션이 만료되었습니다. 다시 로그인 해주세요.');
        localStorage.removeItem('accessToken');
        router.replace('/login');
      });
  }, [router, baseUrl]);

  const { ingredients, deleteIngredient, refetchIngredients } = useIngredients(username);

  // 데이터 확인용 콘솔
  useEffect(() => {
    if (ingredients) {
      console.log('ingredients 데이터:', ingredients);
    }
  }, [ingredients]);

  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [isFrozenToggle, setIsFrozenToggle] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [activeTab, setActiveTab] = useState('stock');
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    if (selectedIngredient) {
      setIsFrozenToggle(!!selectedIngredient.frozen);
      setPurchaseDate(selectedIngredient.purchaseDate ? new Date(selectedIngredient.purchaseDate) : null);
      setExpiryDate(selectedIngredient.expiryDate ? new Date(selectedIngredient.expiryDate) : null);
    }
  }, [selectedIngredient]);

  const updateFrozenStatus = async (id, isFrozen) => {
    try {
      await api.patch(`${baseUrl}/user-ingredients/${id}/frozen`, { frozen: isFrozen }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      alert('냉동 보관 상태 저장 실패!');
    }
  };

  const updateDates = async (id) => {
    try {
      await api.patch(`${baseUrl}/user-ingredients/${id}/dates`, {
        purchaseDate: purchaseDate?.toISOString().split('T')[0],
        expiryDate: expiryDate?.toISOString().split('T')[0],
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      alert('날짜 저장 실패!');
    }
  };

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setShowConfirmModal(true);
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

  if (!token || !username) return null;

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
                className={`${styles.card} 
                  ${item.frozen ? styles.frozenCard : ''} 
                  ${item.expiryDaysLeft !== null && item.expiryDaysLeft <= 3 && !item.frozen ? styles.pinkCard : ''}`}
                onClick={() => setSelectedIngredient(item)}
              >
                <button
                  className={styles.top}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                >
                  ✕
                </button>

                <div className={styles.cardContent}>
                  <div className={styles.emoji}>
                    {item.imageUrl && item.imageUrl !== 'null' ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className={styles.thumbnail}
                      />
                    ) : (
                      categoryEmojiMap[item.category] || '📦'
                    )}
                  </div>
                  <div className={styles.textContent}>
                    <div className={styles.category}>
                      {item.category || '분류 없음'}
                      {!item.frozen &&
                        item.expiryDaysLeft !== null &&
                        item.expiryDaysLeft >= 0 &&
                        item.expiryDaysLeft <= 3 && (
                          <span className={`${styles.dDay} ${item.frozen ? styles.hideDDayCircle : ''}`}>
                            D-{item.expiryDaysLeft}
                          </span>
                        )}
                      {item.frozen && <span className={styles.frozenIcon}>❄️</span>}
                    </div>
                    <div className={styles.nameDday}>
                      <span className={styles.name}>{item.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedIngredient && (
          <div
            className={styles.overlay}
            onClick={() => setSelectedIngredient(null)}
          >
            <div
              className={styles.detailContainer}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.detailHeader}>

                <div className={selectedIngredient.imageUrl && selectedIngredient.imageUrl !== 'null' ? styles.emoji : styles.emojiIcon}>
                  {selectedIngredient.imageUrl && selectedIngredient.imageUrl !== 'null' ? (
                    <img
                      src={selectedIngredient.imageUrl}
                      alt={selectedIngredient.name}
                      className={styles.thumbnail}
                    />
                  ) : (
                    categoryEmojiMap[selectedIngredient.category] || '📦'
                  )}
                </div>

                <div className={styles.detailInfo}>
                  <div className={styles.category}>
                    {selectedIngredient.category}
                  </div>
                  <div className={styles.name}>{selectedIngredient.name}</div>
                </div>

                {!isFrozenToggle && selectedIngredient.expiryDaysLeft !== null && (
                  <span className={styles.dDay}>D-{selectedIngredient.expiryDaysLeft}</span>
                )}
                {isFrozenToggle && (
                  <span className={styles.frozenText}>❄️ 냉동</span>
                )}
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
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(selectedIngredient.id)}
                >
                  재료 삭제
                </button>
                <button className={styles.completeBtn} onClick={handleComplete}>
                  완료하기
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddOptions && (
          <div className={styles.addOptionsFix}>
            <button
              className={styles.addOptionBtn}
              onClick={() => router.push('/ingredients-select')}
            >
              재료 추가
            </button>
            <button
              className={styles.addOptionBtn}
              onClick={() => alert('OCR 자동 인식 클릭됨')}
            >
              OCR 자동 인식
            </button>
          </div>
        )}

        <button
          className={styles.recipeRecommendBtn}
          onClick={() => alert('레시피 추천 클릭됨')}
        >
          ✨레시피 추천받기
        </button>
        <button
          className={styles.addButton}
          onClick={() => setShowAddOptions(!showAddOptions)}
        >
          ＋
        </button>

        {showConfirmModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalBox}>
              <p className={styles.modalText}>정말 삭제하시겠습니까?</p>
              <div className={styles.modalButtons}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setShowConfirmModal(false)}
                >
                  취소
                </button>
                <button
                  className={styles.confirmBtn}
                  onClick={async () => {
                    const success = await deleteIngredient(deleteTargetId);
                    if (success && selectedIngredient?.id === deleteTargetId)
                      setSelectedIngredient(null);
                    setShowConfirmModal(false);
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}

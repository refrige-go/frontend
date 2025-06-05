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
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortOption, setSortOption] = useState('createdDesc'); // 기본 등록순(최신순)
  

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
  
  // 레시피 추천 관련 상태 추가
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [modalSelectedIngredientIds, setModalSelectedIngredientIds] = useState([]);
  const [isRecommending, setIsRecommending] = useState(false);

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

  // 레시피 추천 모달에서 재료 선택/해제
  const handleModalIngredientSelect = (id) => {
    setModalSelectedIngredientIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

// 스마트 레시피 추천 API 호출
const handleModalRecommend = async () => {
  try {
    setIsRecommending(true);

    const selectedIngredientNames = ingredients
      .filter(ingredient => modalSelectedIngredientIds.includes(ingredient.id))
      .map(ingredient => ingredient.name);
    
    // 사용자 재료 정보 구성 (유통기한 포함)
    const userIngredients = ingredients
      .filter(ingredient => modalSelectedIngredientIds.includes(ingredient.id))
      .map(ingredient => ({
        name: ingredient.name,
        expiryDaysLeft: ingredient.expiryDaysLeft,
        frozen: ingredient.frozen,
        category: ingredient.category,
        customName: ingredient.customName
      }));
    
    // 스마트 추천 요청 데이터 구성
    const requestData = {
      userId: username,
      selectedIngredients: selectedIngredientNames,
      userIngredients: userIngredients,
      limit: 10
    };

    console.log('스마트 추천 요청 데이터:', requestData);
    console.log('선택된 재료 이름들:', selectedIngredientNames);
    console.log('사용자 재료 정보:', userIngredients);

    // 최소 1개 재료 검증 (스마트 추천은 1개부터 가능)
    if (selectedIngredientNames.length < 1) {
      alert('최소 1개 이상의 재료를 선택해주세요.');
      return;
    }

    // 스마트 추천 API 호출
    const response = await fetch(`${baseUrl}/api/recommendations/smart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData)
    });

    console.log('응답 상태:', response.status);

    const responseText = await response.text();
    console.log('응답 텍스트:', responseText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      throw new Error('서버 응답을 파싱할 수 없습니다.');
    }

    console.log('스마트 추천 결과:', data);
      
    // 추천 결과 처리
    if (data && data.recommendedRecipes) {
      // 각 레시피의 missingIngredients 디버깅
      data.recommendedRecipes.forEach((recipe, index) => {
        console.log(`레시피 ${index + 1}: ${recipe.recipeName}`);
        console.log(`- missingIngredients:`, recipe.missingIngredients);
        console.log(`- missingIngredients type:`, typeof recipe.missingIngredients);
        console.log(`- missingIngredients is array:`, Array.isArray(recipe.missingIngredients));
        if (Array.isArray(recipe.missingIngredients)) {
          console.log(`- missingIngredients length:`, recipe.missingIngredients.length);
        }
        console.log(`- matchedIngredients:`, recipe.matchedIngredients);
        console.log('---');
      });
      // 스마트 추천 결과를 sessionStorage에 저장
      sessionStorage.setItem('smartRecommendedRecipes', JSON.stringify(data));
      
      // 모달 닫기
      setShowRecommendModal(false);
      setModalSelectedIngredientIds([]);
      
      // 카테고리별 개수 정보 표시
      const { categoryInfo, urgentIngredients } = data;
      let alertMessage = `${data.totalCount}개의 레시피를 추천받았습니다!\n`;
      
      if (categoryInfo) {
        if (categoryInfo.perfectMatches > 0) {
          alertMessage += `✅ 바로 만들 수 있는 요리: ${categoryInfo.perfectMatches}개\n`;
        }
        if (categoryInfo.oneMissingMatches > 0) {
          alertMessage += `🛒 재료 1개만 사면 OK: ${categoryInfo.oneMissingMatches}개\n`;
        }
        if (categoryInfo.twoMissingMatches > 0) {
          alertMessage += `🛒 재료 2개만 사면 OK: ${categoryInfo.twoMissingMatches}개\n`;
        }
      }
      
      if (urgentIngredients && urgentIngredients.length > 0) {
        alertMessage += `⚠️ 빨리 사용해야 할 재료: ${urgentIngredients.join(', ')}`;
      }
      
      alert(alertMessage);
      
      // 레시피 페이지로 이동
      router.push('/recipes/recommended');
    } else {
      alert('추천할 레시피가 없습니다. 다른 재료를 선택해보세요.');
    }
      
  } catch (error) {
    console.error('스마트 추천 오류:', error);
    alert(`레시피 추천에 실패했습니다: ${error.message}`);
  } finally {
    setIsRecommending(false);
  }
};

  const filteredIngredients = ingredients
  .filter((item) =>
    activeTab === 'expired'
      ? item.expiryDaysLeft !== null && item.expiryDaysLeft < 0
      : item.expiryDaysLeft === null || item.expiryDaysLeft >= 0
  )
  .filter((item) =>
    item.name.toLowerCase().includes(searchKeyword.toLowerCase())
  )
  .sort((a, b) => {
    if (sortOption === 'createdDesc') {
      return new Date(b.createdAt) - new Date(a.createdAt); // 등록순(최신순)
    }
    if (sortOption === 'expiryAsc') {
      const aVal = a.expiryDaysLeft === null ? Infinity : a.expiryDaysLeft;
      const bVal = b.expiryDaysLeft === null ? Infinity : b.expiryDaysLeft;
      return aVal - bVal;
    }
    if (sortOption === 'expiryDesc') {
      const aVal = a.expiryDaysLeft === null ? Infinity : a.expiryDaysLeft;
      const bVal = b.expiryDaysLeft === null ? Infinity : b.expiryDaysLeft;
      return bVal - aVal;
    }
    if (sortOption === 'nameAsc') {
      return a.name.localeCompare(b.name);
    }
    if (sortOption === 'nameDesc') {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });  

  if (!token || !username) return null;

  return (
    <div className={styles.pageWrapper}>
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

        <div className={styles.filterBar}>
  <input
    type="text"
    placeholder="재료 이름 검색"
    value={searchKeyword}
    onChange={(e) => setSearchKeyword(e.target.value)}
    className={styles.searchInput}
  />
<select
  value={sortOption}
  onChange={(e) => setSortOption(e.target.value)}
  className={styles.sortSelect}
>
  <option value="createdDesc">등록순</option>
  <option value="expiryAsc">유통기한 오름차순</option>
  <option value="expiryDesc">유통기한 내림차순</option>
  <option value="nameAsc">이름 오름차순</option>
  <option value="nameDesc">이름 내림차순</option>
</select>


</div>


        <div className={styles.scrollArea}>
          <div className={styles.grid}>
            {filteredIngredients.map((item) => (
              <div
              key={item.id}
              className={`${styles.card} 
                ${item.frozen ? styles.frozenCard : ''} 
                ${item.expiryDaysLeft !== null && item.expiryDaysLeft < 0 ? styles.expiredCard : ''}
                ${item.expiryDaysLeft !== null && item.expiryDaysLeft <= 3 && item.expiryDaysLeft >= 0 && !item.frozen ? styles.warningCard : ''}
              `}
              onClick={() => setSelectedIngredient(item)}
            >            

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
     {`D-${item.expiryDaysLeft}`}
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
    onClick={() => {
      if (!showConfirmModal) setSelectedIngredient(null);  // ❗ 모달 떠있으면 상세 닫힘 막기
    }}
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
  <div
    className={styles.addOptionsOverlay} // 배경 클릭 영역
    onClick={() => setShowAddOptions(false)}
  >
    <div
      className={styles.addOptionsFix}
      onClick={(e) => e.stopPropagation()} // 버튼 클릭 시 오버레이 닫힘 방지
    >
      <button
        className={styles.addOptionBtn}
        onClick={() => router.push('/ingredients-select')}
      >
        재료 추가
      </button>
      <button
        className={styles.addOptionBtn}
        onClick={() => router.push('/ocr')}
      >
        OCR 자동 인식
      </button>
    </div>
  </div>
)}


        {/* 레시피 추천 모달 */}
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
              <h2 style={{ marginBottom: 20, fontWeight: 700, fontSize: 22, color: '#f97316' }}>
                스마트 재료 선택 (최소 1개)
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
                        border: '2px solid #f97316',
                        borderRadius: '50%',
                        marginRight: 14,
                        background: modalSelectedIngredientIds.includes(item.id) ? '#f97316' : '#fff',
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
                    color: '#f97316',
                    border: '1.5px solid #f97316',
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
                  disabled={isRecommending || modalSelectedIngredientIds.length < 1}
                  style={{
                    padding: '0.6rem 1.2rem',
                    background: (isRecommending || modalSelectedIngredientIds.length < 1) ? '#ccc' : '#f97316',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: (isRecommending || modalSelectedIngredientIds.length < 1) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(247,151,22,0.08)',
                    transition: 'background 0.2s',
                  }}
                >
                  {isRecommending ? '추천 중...' : `스마트 추천받기 (${modalSelectedIngredientIds.length}개 선택)`}
                </button>
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
    </div>
  );
}
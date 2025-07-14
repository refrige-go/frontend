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

// 모바일 환경 감지 함수 추가
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         ('ontouchstart' in window) ||
         (navigator.maxTouchPoints > 0);
};

// 디버깅 함수 추가
const debugLog = (message, data) => {
  console.log(`[RefrigeratorComponent] ${message}`, data);
};

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
  
  // useState 선언부를 useEffect 위로 이동
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  
  // 전체 선택/삭제 관련 상태
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  
  // 레시피 추천 관련 상태 (선택 모드에서 사용)
  const [isRecommending, setIsRecommending] = useState(false);

  useEffect(() => {
    debugLog('컴포넌트 마운트됨', {
      isMobile: isMobile(),
      userAgent: navigator.userAgent,
      touchPoints: navigator.maxTouchPoints,
      hasTouch: 'ontouchstart' in window
    });
    
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
        debugLog('토큰 인증 성공', payload?.username);
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
      debugLog('ingredients 데이터 업데이트', {
        count: ingredients.length,
        ingredients: ingredients.map(i => ({ id: i.id, name: i.name }))
      });
    }
  }, [ingredients]);

  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [isFrozenToggle, setIsFrozenToggle] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [activeTab, setActiveTab] = useState('stock');
  
  useEffect(() => {
    if (selectedIngredient) {
      setIsFrozenToggle(!!selectedIngredient.frozen);
      // 날짜 처리 개선
      if (selectedIngredient.purchaseDate) {
        const purchaseDate = new Date(selectedIngredient.purchaseDate);
        // 날짜가 유효한지 확인
        if (!isNaN(purchaseDate.getTime())) {
          setPurchaseDate(purchaseDate);
        } else {
          setPurchaseDate(null);
        }
      } else {
        setPurchaseDate(null);
      }
      
      if (selectedIngredient.expiryDate) {
        const expiryDate = new Date(selectedIngredient.expiryDate);
        // 날짜가 유효한지 확인
        if (!isNaN(expiryDate.getTime())) {
          setExpiryDate(expiryDate);
        } else {
          setExpiryDate(null);
        }
      } else {
        setExpiryDate(null);
      }
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
      const requestData = {
        purchaseDate: purchaseDate ? purchaseDate.toISOString().split('T')[0] : null,
        expiryDate: expiryDate ? expiryDate.toISOString().split('T')[0] : null,
      };
      
      console.log('날짜 업데이트 요청:', requestData);
      
      await api.patch(`${baseUrl}/user-ingredients/${id}/dates`, requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('날짜 업데이트 오류:', error);
      alert('날짜 저장 실패!');
    }
  };

  // 전체 선택/삭제 기능 함수들
  const handleSelectionModeToggle = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIngredientIds([]);
  };

  const handleSelectAll = () => {
    if (selectedIngredientIds.length === filteredIngredients.length) {
      setSelectedIngredientIds([]);
    } else {
      setSelectedIngredientIds(filteredIngredients.map(item => item.id));
    }
  };

  const handleIngredientSelect = (id) => {
    setSelectedIngredientIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIngredientIds.length === 0) {
      alert('삭제할 재료를 선택해주세요.');
      return;
    }
    setShowBulkDeleteModal(true);
  };

  // 선택 모드에서 스마트 추천받기 (바로 페이지 이동)
  const handleSelectionModeRecommend = async () => {
    if (selectedIngredientIds.length === 0) {
      alert('추천받을 재료를 선택해주세요.');
      return;
    }

    try {
      setIsRecommending(true);

      const selectedIngredientNames = ingredients
        .filter(ingredient => selectedIngredientIds.includes(ingredient.id))
        .map(ingredient => ingredient.name);
      
      // 사용자 재료 정보 구성 (유통기한 포함)
      const userIngredients = ingredients
        .filter(ingredient => selectedIngredientIds.includes(ingredient.id))
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

      console.log('선택 모드 스마트 추천 요청 데이터:', requestData);

      // 스마트 추천 API 호출
      const response = await fetch(`${baseUrl}/api/recommendations/smart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData)
      });

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

      console.log('선택 모드 스마트 추천 결과:', data);
        
      // 추천 결과 처리
      if (data && data.recommendedRecipes) {
        // 스마트 추천 결과를 sessionStorage에 저장
        sessionStorage.setItem('smartRecommendedRecipes', JSON.stringify(data));
        
        // 선택 모드 종료
        setIsSelectionMode(false);
        setSelectedIngredientIds([]);
        
        // 레시피 페이지로 바로 이동
        router.push('/recipes/recommended');
      } else {
        alert('추천할 레시피가 없습니다. 다른 재료를 선택해보세요.');
      }
        
    } catch (error) {
      console.error('선택 모드 스마트 추천 오류:', error);
      alert(`레시피 추천에 실패했습니다: ${error.message}`);
    } finally {
      setIsRecommending(false);
    }
  };

  const confirmBulkDelete = async () => {
    try {
      // 선택된 재료들을 순차적으로 삭제
      for (const id of selectedIngredientIds) {
        await deleteIngredient(id);
      }
      
      // 선택 모드 종료 및 상태 초기화
      setIsSelectionMode(false);
      setSelectedIngredientIds([]);
      setShowBulkDeleteModal(false);
      
      alert(`${selectedIngredientIds.length}개의 재료가 삭제되었습니다.`);
    } catch (error) {
      console.error('일괄 삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
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
    <div className="mainContainer">
      <Header />
      <div className="appContainer">
        <div className="scrollContent">
          {/* 고정 헤더 영역 */}
          <div className={styles.stickyHeader}>
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

            {/* 선택 모드 버튼들 */}
            <div className={styles.selectionControls}>
              <button
                className={isSelectionMode ? styles.selectionModeActive : styles.selectionModeBtn}
                onClick={handleSelectionModeToggle}
              >
                {isSelectionMode ? '선택 취소' : '재료 선택'}
              </button>
              
              {/* 선택 모드일 때 전체 선택/삭제 버튼 */}
              {isSelectionMode && (
                <>
                  <button
                    className={styles.selectAllBtn}
                    onClick={handleSelectAll}
                  >
                    {selectedIngredientIds.length === filteredIngredients.length ? '전체 해제' : '전체 선택'}
                  </button>
                  <button
                    className={styles.bulkDeleteBtn}
                    onClick={handleBulkDelete}
                    disabled={selectedIngredientIds.length === 0}
                  >
                    삭제 ({selectedIngredientIds.length})
                  </button>
                </>
              )}
              
              {/* 선택 모드가 아닐 때 재료 추가 버튼들 */}
              {!isSelectionMode && (
                <>
                  <button
                    className={styles.addIngredientBtn}
                    onClick={() => router.push('/ingredients-select')}
                  >
                    재료 목록에서{'\n'}선택하여 추가
                  </button>
                  <button
                    className={styles.ocrBtn}
                    onClick={() => router.push('/ocr')}
                  >
                    영수증 인식
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 재료 카드 그리드 */}
          <div className={styles.grid}>
            {filteredIngredients.map((item) => (
              <div
                key={item.id}
                className={`${styles.card} 
                  ${item.frozen ? styles.frozenCard : ''} 
                  ${item.expiryDaysLeft !== null && item.expiryDaysLeft < 0 ? styles.expiredCard : ''}
                  ${item.expiryDaysLeft !== null && item.expiryDaysLeft <= 3 && item.expiryDaysLeft >= 0 && !item.frozen ? styles.warningCard : ''}
                  ${isSelectionMode && selectedIngredientIds.includes(item.id) ? styles.selectedCard : ''}
                `}
                onClick={() => {
                  if (isSelectionMode) {
                    handleIngredientSelect(item.id);
                  } else {
                    setSelectedIngredient(item);
                  }
                }}
              >
                {/* 선택 모드일 때 체크박스 */}
                {isSelectionMode && (
                  <div className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      checked={selectedIngredientIds.includes(item.id)}
                      onChange={() => handleIngredientSelect(item.id)}
                      className={styles.selectionCheckbox}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
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
                      {item.frozen && <span className={styles.frozenIcon}>❄️</span>}
                    </div>
                    <div className={styles.nameDday}>
                      <span className={styles.name}>{item.name}</span>
                      {!item.frozen && item.expiryDaysLeft !== null && (
                        <span className={styles.dDay}>
                          {item.expiryDaysLeft < 0 ? 
                            `만료 ${Math.abs(item.expiryDaysLeft)}일` : 
                            `D-${item.expiryDaysLeft}`}
                        </span>
                      )}
                      {!item.frozen && item.expiryDaysLeft === null && (
                        <span className={styles.dDay} style={{ backgroundColor: '#f3f4f6', color: '#6b7280', borderColor: '#d1d5db' }}>
                          기한 없음
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 레시피 추천 버튼 - 선택 모드에서 재료를 선택했을 때만 활성화 */}
        <button
          className={styles.recipeRecommendBtn}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // 선택 모드일 때만 작동
            if (isSelectionMode && selectedIngredientIds.length > 0) {
              handleSelectionModeRecommend();
            }
          }}
          disabled={!isSelectionMode || selectedIngredientIds.length === 0 || isRecommending}
        >
          {isRecommending 
            ? '추천 중...' 
            : isSelectionMode 
              ? selectedIngredientIds.length === 0 
                ? '재료를 선택해주세요'
                : `선택한 재료로 추천받기 (${selectedIngredientIds.length}개)` 
              : '재료를 선택하고 AI 레시피 추천받기'
          }
        </button>
      </div>
      {/* overlay를 mainContainer 바로 아래에 렌더링 */}
      {(selectedIngredient || showConfirmModal || showBulkDeleteModal) && (
        <div
          className={styles.overlay}
          onClick={() => {
            setSelectedIngredient(null);
            setShowConfirmModal(false);
            setShowBulkDeleteModal(false);
          }}
        >
          {/* 바텀 모달(카드)는 항상 하단에 */}
          {selectedIngredient && (
            <div
              className={styles.detailContainer}
              onClick={e => e.stopPropagation()}
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
                    dateFormat="yyyy-MM-dd"
                    locale={ko}
                    withPortal
                    portalId="root-portal"
                    className={styles.dateInput}
                    placeholderText="날짜를 선택하세요"
                  />
                </div>
                <div>
                  <span>소비기한</span>
                  <DatePicker
                    selected={expiryDate}
                    onChange={(date) => setExpiryDate(date)}
                    dateFormat="yyyy-MM-dd"
                    locale={ko}
                    withPortal
                    portalId="root-portal"
                    className={styles.dateInput}
                    disabled={isFrozenToggle}
                    placeholderText="날짜를 선택하세요"
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
          )}
          {/* 삭제 확인 모달은 position: fixed로 중앙에 */}
          {showConfirmModal && (
            <div
              className={styles.modalBox}
              onClick={e => e.stopPropagation()}
            >
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
          )}
          
          {/* 일괄 삭제 확인 모달 */}
          {showBulkDeleteModal && (
            <div
              className={styles.modalBox}
              onClick={e => e.stopPropagation()}
            >
              <p className={styles.modalText}>선택한 {selectedIngredientIds.length}개의 재료를<br/>정말 삭제하시겠습니까?</p>
              <div className={styles.modalButtons}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setShowBulkDeleteModal(false)}
                >
                  취소
                </button>
                <button
                  className={styles.confirmBtn}
                  onClick={confirmBulkDelete}
                >
                  일괄 삭제
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* BottomNavigation은 항상 렌더링 */}
      <BottomNavigation />
    </div>
  );
}

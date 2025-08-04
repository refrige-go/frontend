'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import SubPageHeader from '../../components/layout/SubPageHeader';
import BottomNavigation from '../../components/layout/BottomNavigation';
import styles from '../../styles/pages/ingredientselect.module.css';
import api from '../../lib/api';

// 카테고리 아이콘 매핑
const iconMap = {
  '전체': '🍔',
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

const categoryMap = {
  GRAIN_POWDER: '곡류/분말',
  FRUIT: '과일',
  VEGETABLE: '채소',
  MEAT: '육류',
  SEAFOOD: '수산물/해산물',
  DAIRY: '유제품',
  BEAN: '두류/콩류',
  NOODLE_RICE_CAKE: '면/떡',
  OIL: '기름/유지',
  MUSHROOM: '버섯',
  PROCESSED_FOOD: '가공식품',
  SEASONING: '조미료/양념',
  PICKLE: '장아찌/절임',
  ETC: '기타'
};

const categoryOrder = [
  '전체', '곡류/분말', '과일', '채소', '육류', '수산물/해산물',
  '유제품', '두류/콩류', '면/떡', '기름/유지', '버섯',
  '가공식품', '조미료/양념', '장아찌/절임', '기타'
];

function getCategoryIcon(name) {
  return iconMap[name] || '🍽️';
}

export default function IngredientSelectComponent() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [allIngredients, setALLIngredients] = useState([]); //사용자가 선택한 재료들 저장
  const [ingredients, setIngredients] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [token, setToken] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
  const [searchKeyword, setSearchKeyword] = useState('');
  const scrollContentRef = useRef(null);
  const buttonRef = useRef(null);
  const [bottomPadding, setBottomPadding] = useState(0);
  const mainContainerRef = useRef(null);
  const actionBarRef = useRef(null);

  useLayoutEffect(() => {
    const el = scrollContentRef.current;
    const main = mainContainerRef.current;
    const actionBar = actionBarRef.current;
    const nav = document.querySelector('.bottom-navigation');
    const header = main?.querySelector('.headerRow');
    const filter = main?.querySelector('div[style*="position: sticky"]');
    if (el && main && actionBar && nav) {
      const navHeight = nav.getBoundingClientRect().height;
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      const filterHeight = filter ? filter.getBoundingClientRect().height : 0;
      const actionBarHeight = actionBar.getBoundingClientRect().height;
      // mainContainer의 높이에서 상단(header+filter)과 하단(actionBar+nav+여유) 빼기
      const scrollHeight = main.offsetHeight - (headerHeight + filterHeight + actionBarHeight + navHeight + 16);
      el.style.height = scrollHeight + 'px';
      setBottomPadding(0);
    } else {
      setBottomPadding(0);
      if (el) el.style.height = '';
    }
  }, [selectedIds, ingredients, searchKeyword]);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (!storedToken) {
      alert('로그인 후 이용해주세요.');
      router.push('/login');
    } else {
      setToken(storedToken);
    }
  }, [router]);

  useEffect(() => {
    if (!token) return;
    api.get('/api/ingredients/categories', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const converted = res.data.map((en) => categoryMap[en] || en);
        setCategories(['전체', ...converted]);
      })
      .catch((err) => console.error('카테고리 불러오기 실패:', err));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const query = selectedCategory === '전체' ? '' : `?category=${selectedCategory}`;
    api.get(`/api/ingredients${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const items = res.data;
        // 전체일 경우에만 재료 순서 섞기
        if (selectedCategory === '전체') {
          const shuffled = [...items].sort(() => Math.random() - 0.5);
          setIngredients(shuffled);
          setALLIngredients(items);
        } else {
          setIngredients(items);
        }
      })
      .catch((err) => console.error('재료 불러오기 실패:', err));
  }, [selectedCategory, token]);

  useLayoutEffect(() => {
    const el = scrollContentRef.current;
    if (el) {
      // 하단 패딩을 bottom navigation 세로 영역 + 10px(80px)로 고정
      el.style.paddingBottom = '80px';
    }
  }, [selectedIds, ingredients, searchKeyword]);

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    if (selectedIds.length === 0) {
      alert('재료를 선택해주세요.');
      return;
    }

    if (!token) {
      alert('로그인 후 이용해주세요.');
      router.push('/login');
      return;
    }

    const today = new Date();
    const selectedIngredients = allIngredients.filter((item) =>
      selectedIds.includes(item.id)
    );

    const ingredientsToAdd = selectedIngredients.map((item) => {
      const expiry = new Date(today);
      expiry.setDate(expiry.getDate() + (item.defaultExpiryDays || 7));
      return {
        ingredientId: item.id,
        customName: null,
        purchaseDate: today.toISOString().slice(0, 10),
        expiryDate: expiry.toISOString().slice(0, 10),
        isFrozen: false
      };
    });

    try {
      await api.post(`${baseUrl}/user-ingredients/batch-add`, {
        ingredients: ingredientsToAdd
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      router.push('/refrigerator');
    } catch (err) {
      console.error('재료 추가 실패:', err);
      alert('오류가 발생했습니다.');
    }
  };

  const rightAction = (
    <button
      onClick={() => router.push('/ingredients-add')}
      style={{
        background: '#f59e42',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        minWidth: '60px',
        minHeight: '36px',
      }}
    >
      수동 추가
    </button>
  );

  return (
    <div className="mainContainer" ref={mainContainerRef}>
      <SubPageHeader title="재료 목록" rightAction={rightAction} />
      
      <div className="appContainerSub">
        {/* 검색 및 카테고리 필터 (고정) */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 19,
          background: '#fff',
          padding: '16px 0',
          borderBottom: '1px solid #f3f3f3',
        }}>
          <div className={styles.searchWrap}>
            <input
              type="text"
              placeholder="냉장고 속 재료를 찾아보세요!"
              className={styles.searchInput}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <span className={styles.searchIcon}>🔍</span>
          </div>
          <div className={styles.categoryGrid} style={{marginTop: 16}}>
            {categoryOrder
              .filter((cat) => categories.includes(cat))
              .map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.active : ''}`}
                >
                  <span className={styles.categoryIcon}>{getCategoryIcon(cat)}</span>
                  <span className={styles.categoryLabel}>{cat}</span>
                </button>
              ))}
          </div>
        </div>

        {/* 재료 목록 (스크롤 가능) */}
        <div
          className="scrollContent"
          ref={scrollContentRef}
          style={{ paddingBottom: bottomPadding }}
        >
          <ul className={styles.ingredientList}>
            {ingredients
              .filter((item) =>
                searchKeyword.trim() === '' ||
                item.name.includes(searchKeyword.trim())
              )
              .map((item) => (
                <li key={item.id} className={styles.ingredientItem}>
                  <div className={styles.ingredientInfo}>
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className={styles.ingredientImage}
                      />
                    ) : (
                      <span className={styles.ingredientEmoji}>
                        {getCategoryIcon(item.category)}
                      </span>
                    )}
                    <span className={styles.ingredientName}>{item.name}</span>
                  </div>
                  <input
                    type="checkbox"
                    className={styles.addButton}
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelection(item.id)}
                  />
                </li>
              ))}
          </ul>
        </div>
        {/* 완료 버튼 - 스크롤 영역 바깥에 위치 */}
        {selectedIds.length > 0 && (
          <div className={styles.actionBar} ref={actionBarRef}>
            <button
              className={styles.clearBtn}
              onClick={() => setSelectedIds([])}
            >
              전체 선택 해제
            </button>
            <button
              ref={buttonRef}
              onClick={handleComplete}
              className={styles.recipeRecommendBtn}
            >
              선택한 재료 {selectedIds.length}개 추가하기
            </button>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
}

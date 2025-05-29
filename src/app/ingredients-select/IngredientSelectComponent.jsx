'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
  const [ingredients, setIngredients] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [token, setToken] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

  // 로그인 여부 확인
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (!storedToken) {
      alert('로그인 후 이용해주세요.');
      router.push('/login');
    } else {
      setToken(storedToken);
    }
  }, [router]);

  // 카테고리 불러오기
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

  // 선택된 카테고리에 따라 재료 불러오기
  useEffect(() => {
    if (!token) return;
    const query = selectedCategory === '전체' ? '' : `?category=${selectedCategory}`;
    api.get(`/api/ingredients${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setIngredients(res.data))
      .catch((err) => console.error('재료 불러오기 실패:', err));
  }, [selectedCategory, token]);

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

    const today = new Date().toISOString().slice(0, 10);
    const oneWeekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    try {
      await api.post(`${baseUrl}/user-ingredients/batch-add`, {
        ingredients: selectedIds.map((id) => ({
          ingredientId: id,
          customName: null,
          purchaseDate: today,
          expiryDate: oneWeekLater,
          isFrozen: false
        }))
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      router.back();
    } catch (err) {
      console.error('재료 추가 실패:', err);
      alert('오류가 발생했습니다.');
    }
  };

  return (
    <div className="mainContainer">
      <div className="appContainer">
        <div className={styles.headerRow}>
          <button onClick={() => router.back()} className={styles.backBtn}>←</button>
          <h2 className={styles.pageTitle}>재료 목록</h2>
          <button onClick={handleComplete} className={styles.doneBtn}>완료</button>
        </div>

        <div className={styles.searchWrap}>
          <input
            type="text"
            placeholder="냉장고 속 재료를 찾아보세요!"
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>

        <div className={styles.categoryGrid}>
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

        <div className={styles.ingredientScroll}>
          <ul className={styles.ingredientList}>
            {ingredients.map((item) => (
              <li key={item.id} className={styles.ingredientItem}>
                <div className={styles.ingredientInfo}>
                  <img
                    src={item.imageUrl || '/images/default.jpg'}
                    alt=""
                    className={styles.ingredientImage}
                  />
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

        <button
          className={styles.addManualBtn}
          onClick={() => router.push('/ingredients-add')}
        >
          + 직접 추가
        </button>
      </div>
      <BottomNavigation />
    </div>
  );
}

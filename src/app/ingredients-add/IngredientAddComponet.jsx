'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from '../../styles/pages/ingredientadd.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import api from '../../lib/api';
import { format } from 'date-fns';

// 영어 enum → 한글 매핑
const categoryMap = {
  GRAIN_POWDER: '곡류/분말',
  MEAT: '육류',
  SEAFOOD: '수산물/해산물',
  VEGETABLE: '채소',
  FRUIT: '과일',
  MUSHROOM: '버섯',
  DAIRY: '유제품',
  BEAN: '두류/콩류',
  SEASONING: '조미료/양념',
  OIL: '기름/유지',
  NOODLE_RICE_CAKE: '면/떡',
  PROCESSED_FOOD: '가공식품',
  PICKLE: '장아찌/절임',
  ETC: '기타',
};

const categoryOrder = [
  'GRAIN_POWDER', 'MEAT', 'SEAFOOD', 'VEGETABLE', 'FRUIT', 'MUSHROOM',
  'DAIRY', 'BEAN', 'SEASONING', 'OIL', 'NOODLE_RICE_CAKE', 'PROCESSED_FOOD',
  'PICKLE', 'ETC',
];

export default function IngredientAddComponent() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [isFrozen, setIsFrozen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('/images/default.jpg');
  const [showPurchasePicker, setShowPurchasePicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  const [token, setToken] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (!storedToken) {
      alert('로그인 후 이용해주세요.');
      router.push('/login');
    } else {
      setToken(storedToken);
    }
  }, [router]);

  const getUsernameFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username;
    } catch (e) {
      console.error('JWT 파싱 실패', e);
      return null;
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/api/ingredients/categories', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sorted = categoryOrder.filter((key) => res.data.includes(key));
        setCategories(sorted);
        setCategory(sorted[0] || '');
      } catch (err) {
        console.error('카테고리 불러오기 실패:', err);
      }
    };
    if (token) fetchCategories();
  }, [token]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview('/images/default.jpg');
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      alert('로그인 후 이용해주세요.');
      router.push('/login');
      return;
    }

    const username = getUsernameFromToken(token);
    if (!username) {
      alert('유저 정보 확인 실패');
      return;
    }

    if (!name.trim()) {
      alert('재료명을 입력해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('customName', name);
    formData.append('customCategory', categoryMap[category]); // ✅ 한글로 변환해서 전송
    formData.append('purchaseDate', purchaseDate.toISOString().split('T')[0]);
    formData.append('expiryDate', expiryDate.toISOString().split('T')[0]);
    formData.append('isFrozen', isFrozen.toString());
    if (imageFile) formData.append('image', imageFile);

    try {
      await api.post(`${baseUrl}/user-ingredients`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      router.push('/refrigerator');
    } catch (err) {
      console.error('추가 실패:', err);
      alert('재료 추가 중 오류가 발생했습니다.');
    }
  };

  const togglePurchasePicker = () => setShowPurchasePicker((prev) => !prev);
  const toggleExpiryPicker = () => {
    if (!isFrozen) setShowExpiryPicker((prev) => !prev);
  };

  return (
    <div className="mainContainer">
      <div className="appContainer">
        <div className={styles.headerRow}>
          <button onClick={() => router.back()} className={styles.backBtn}>←</button>
          <h2 className={styles.pageTitle}>직접 추가</h2>
          <button onClick={handleSubmit} className={styles.doneBtn}>완료</button>
        </div>

        <div className={styles.form}>
          <div className={styles.imageBox}>
            <label>재료 사진</label>
            <div className={styles.imagePlaceholder}>
              {imagePreview === '/images/default.jpg' ? (
                <span className={styles.plusIcon}>+</span>
              ) : (
                <img src={imagePreview} alt="미리보기" />
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>재료명</label>
            <input
              type="text"
              maxLength={6}
              placeholder="최대 6자까지 입력할 수 있어요!"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>카테고리</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryMap[cat] || cat}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.row}>
            <span className={styles.label}>구매일자</span>
            <span onClick={togglePurchasePicker} className={styles.value}>
              {format(purchaseDate, 'yyyy년 MM월 dd일')}
            </span>
          </div>
          {showPurchasePicker && (
            <div className={styles.datePickerWrapper}>
              <DatePicker
                selected={purchaseDate}
                onChange={(date) => {
                  setPurchaseDate(date);
                  setShowPurchasePicker(false);
                }}
                inline
                locale={ko}
              />
            </div>
          )}

          <div className={styles.row}>
            <span className={styles.label}>소비기한</span>
            <span
              onClick={toggleExpiryPicker}
              className={styles.value}
              style={{
                color: isFrozen ? '#ccc' : 'inherit',
                cursor: isFrozen ? 'not-allowed' : 'pointer',
              }}
            >
              {format(expiryDate, 'yyyy년 MM월 dd일')}
            </span>
          </div>
          {showExpiryPicker && (
            <div className={styles.datePickerWrapper}>
              <DatePicker
                selected={expiryDate}
                onChange={(date) => {
                  setExpiryDate(date);
                  setShowExpiryPicker(false);
                }}
                inline
                locale={ko}
                disabled={isFrozen}
              />
            </div>
          )}

          <div className={styles.toggleGroup}>
            <label>냉동실 보관</label>
            <label className={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={isFrozen}
                onChange={(e) => setIsFrozen(e.target.checked)}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <p className={styles.tip}>Tip: 냉동 보관 시 소비기한이 자동으로 비활성화돼요!</p>
        </div>
      </div>
    </div>
  );
}

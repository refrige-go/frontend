'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/pages/ingredientadd.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import api from '../../lib/api';
import { format } from 'date-fns';

export default function IngredientAddPage() {
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

  // 카테고리 목록 불러오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/api/ingredients/categories');
        setCategories(res.data);
        setCategory(res.data[0] || '');
      } catch (err) {
        console.error('카테고리 불러오기 실패:', err);
      }
    };
    fetchCategories();
  }, []);

  // 이미지 변경 처리
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

  // 재료 추가 제출
  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('customName', name);
    formData.append('customCategory', category);
    formData.append('purchaseDate', purchaseDate.toISOString().split('T')[0]);
    formData.append('expiryDate', expiryDate.toISOString().split('T')[0]);
    formData.append('isFrozen', isFrozen.toString()); // 문자열로 변환
    if (imageFile) formData.append('image', imageFile);

    try {
      await api.post('/user-ingredients', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('재료 추가 완료');
      router.push('/refrigerator');
    } catch (err) {
      console.error('추가 실패:', err);
    }
  };

  // 클릭 시 토글로 열리고 닫히게
  const togglePurchasePicker = () => setShowPurchasePicker(prev => !prev);
  const toggleExpiryPicker = () => {
    if (!isFrozen) setShowExpiryPicker(prev => !prev);
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
          {/* 이미지 업로드 */}
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

          {/* 재료명 */}
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

          {/* 카테고리 */}
          <div className={styles.inputGroup}>
            <label>카테고리</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 구매일자 */}
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

          {/* 소비기한 */}
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

          {/* 냉동 보관 */}
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

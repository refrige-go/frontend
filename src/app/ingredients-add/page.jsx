'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/pages/ingredientadd.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';

export default function IngredientAddPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('곡류/분말');
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [isFrozen, setIsFrozen] = useState(false);

  const categoryOptions = [
    '곡류/분말', '육류', '수산물/해산물', '채소', '과일', '버섯', '유제품',
    '두류/콩류', '조미료/양념', '기름/유지', '면/떡', '가공식품', '장아찌/절임', '기타'
  ];

  const handleSubmit = async () => {
    // TODO: 유효성 검사 & API 연결
    console.log({ name, category, purchaseDate, expiryDate, isFrozen });
    router.back(); // 저장 후 뒤로
  };

  return (
    <div className="mainContainer">
      <div className="appContainer">
        <div className={styles.header}>
          <button onClick={() => router.back()} className={styles.backBtn}>←</button>
          <h2>직접 추가</h2>
          <button onClick={handleSubmit} className={styles.doneBtn}>완료</button>
        </div>

        <div className={styles.form}>
          <div className={styles.imageBox}>
            <label>재료 사진</label>
            <div className={styles.imagePlaceholder}>
              <img src="/images/default.jpg" alt="기본 이미지" />
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
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className={styles.dateGroup}>
            <label>구매일자</label>
            <DatePicker
              selected={purchaseDate}
              onChange={(date) => setPurchaseDate(date)}
              dateFormat="yyyy년 MM월 dd일"
              locale={ko}
              className={styles.dateInput}
            />
          </div>

          <div className={styles.dateGroup}>
            <label>소비기한</label>
            <DatePicker
              selected={expiryDate}
              onChange={(date) => setExpiryDate(date)}
              dateFormat="yyyy년 MM월 dd일"
              locale={ko}
              className={styles.dateInput}
              disabled={isFrozen}
            />
          </div>

          <div className={styles.toggleGroup}>
            <label>냉동실 보관</label>
            <input type="checkbox" checked={isFrozen} onChange={(e) => setIsFrozen(e.target.checked)} />
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useIngredients } from '../../hooks/useIngredients';
import styles from './RefrigeratorPage.module.css';
import Header from '../../components/layout/Header';

export default function RefrigeratorPage() {
  const { ingredients, deleteIngredient } = useIngredients();

  const handleDelete = async (id) => {
    const confirmed = confirm('정말 삭제하시겠습니까?');
    if (!confirmed) return;

    const success = await deleteIngredient(id);
    if (!success) alert('삭제에 실패했습니다.');
  };

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.tabWrap}>
        <button className={styles.tabActive}>냉장고 재고</button>
        <button className={styles.tabInactive}>유통기한 초과</button>
      </div>

      <div className={styles.grid}>
        {ingredients.map((item) => (
          <div key={item.id} className={styles.card}>
            <button
              className={styles.top}
              onClick={() => handleDelete(item.id)}
            >
              ✕
            </button>
            <img src="/images/default.png" alt={item.name} className={styles.image} />
            <div className={styles.meta}>
              <span>채소</span>
              <span className={styles.dDay}>
                {item.expiryDaysLeft !== null ? `D-${item.expiryDaysLeft}` : '기한 없음'}
              </span>
            </div>
            <div className={styles.name}>{item.name}</div>
          </div>
        ))}
      </div>

      <button className={styles.addButton}>＋</button>
    </div>
  );
}

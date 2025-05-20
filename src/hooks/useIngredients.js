import { useEffect, useState } from 'react';
import api from '../lib/api';

export function useIngredients() {
  const [ingredients, setIngredients] = useState([]);

  // 재료 불러오기 함수 밖으로 분리
  async function fetchIngredients() {
    try {
      const res = await api.get('/user-ingredients', {
        params: {
          userId: '1',
        },
      });
      setIngredients(res.data);
    } catch (error) {
      console.error('재료 불러오기 실패:', error);
    }
  }

  // 재료 삭제 함수 추가
  async function deleteIngredient(id) {
    try {
      await api.delete(`/user-ingredients/${id}`);
      // 삭제 성공하면 재료 다시 불러오기
      await fetchIngredients();
      return true;
    } catch (error) {
      console.error('삭제 실패:', error);
      return false;
    }
  }

  useEffect(() => {
    fetchIngredients();
  }, []);

  return { ingredients, fetchIngredients, deleteIngredient };
}

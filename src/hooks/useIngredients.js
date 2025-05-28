import { useEffect, useState } from 'react';
import api from '../lib/api';

export function useIngredients(userId) {
  const [ingredients, setIngredients] = useState([]);

  async function fetchIngredients() {
    if (!userId) return; // userId 없으면 요청 안 함
    try {
      const res = await api.get('/user-ingredients', {
        params: {
          userId: userId,
        },
      });
      setIngredients(res.data);
    } catch (error) {
      console.error('재료 불러오기 실패:', error);
    }
  }

  async function deleteIngredient(id) {
    try {
      await api.delete(`/user-ingredients/${id}`);
      await fetchIngredients();
      return true;
    } catch (error) {
      console.error('삭제 실패:', error);
      return false;
    }
  }

  useEffect(() => {
    fetchIngredients();
  }, [userId]);

  return {
    ingredients,
    deleteIngredient,
    refetchIngredients: fetchIngredients,
  };
}
import { useEffect, useState } from 'react';
import api from '../lib/api';

export function useIngredients() {
  const [ingredients, setIngredients] = useState([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  async function fetchIngredients() {
    if (!token) return;
    try {
      // userId 파라미터 제거하고 헤더에 토큰만 보냄
      const res = await api.get('/user-ingredients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIngredients(res.data);
    } catch (error) {
      console.error('재료 불러오기 실패:', error);
    }
  }

  async function deleteIngredient(id) {
    if (!token) return false;
    try {
      await api.delete(`/user-ingredients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  return {
    ingredients,
    deleteIngredient,
    refetchIngredients: fetchIngredients,
  };
}

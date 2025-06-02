import { useEffect, useState } from 'react';
import api from '../lib/api';

export function useIngredients(username) {
  const [ingredients, setIngredients] = useState([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  async function fetchIngredients() {
    if (!token || !username) return;
    try {
      // username을 쿼리 파라미터로 전달
      const res = await api.get(`/user-ingredients?username=${username}`, {
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
    if (username) {
      fetchIngredients();
    }
  }, [username, token]);

  return {
    ingredients,
    deleteIngredient,
    refetchIngredients: fetchIngredients,
  };
}
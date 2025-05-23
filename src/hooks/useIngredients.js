import { useEffect, useState } from 'react';
import api from '../lib/api';

function getUserIdFromToken() {
  const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.id || payload.sub || null;
  } catch {
    return null;
  }
}

export function useIngredients() {
  const [ingredients, setIngredients] = useState([]);

  // 재료 불러오기 함수 밖으로 분리
  async function fetchIngredients() {
    const userId = getUserIdFromToken();
    if (!userId) {
      window.location.href = '/login';
      return;
    }
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

  return {
    ingredients,
    deleteIngredient,
    refetchIngredients: fetchIngredients,
  };
}

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import BottomNavHome from '../components/BottomNavHome'; // 경로는 실제 위치에 맞게 수정

export default function RecommendationsPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = 1; // 실제 로그인 유저 ID로 바꾸세요

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/bookmark/recommendations?userId=${userId}`);
        if (!res.ok) throw new Error('추천 목록을 불러오는 데 실패했습니다.');
        const data = await res.json();
        setRecipes(data);
      } catch (error) {
        console.error('에러:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) return <p>불러오는 중입니다...</p>;
  if (recipes.length === 0) return <p>추천 레시피가 없습니다.</p>;

  return (
    <>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recipes.map((recipe) => (
          <div
            key={recipe.rcpSeq}
            className="border rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition"
          >
            {recipe.image ? (
              <Image
                src={recipe.image}
                alt={recipe.rcpNm}
                width={400}
                height={300}
                className="w-full h-48 object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                이미지 없음
              </div>
            )}
            <div className="p-4">
              <h2 className="text-lg font-semibold">{recipe.rcpNm}</h2>
              <p className="text-sm text-gray-500">요리 종류: {recipe.cuisineType}</p>
            </div>
          </div>
        ))}
      </div>
      <BottomNavHome />
    </>
  );
}

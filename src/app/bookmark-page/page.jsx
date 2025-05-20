'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import BookmarkCard from '../../components/BookmarkCard';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';

export default function BookmarksPage() {
  const [recipes, setRecipes] = useState([]);
  const userId = 1; // 하드코딩

  useEffect(() => {
    axios.get(`http://localhost:8080/api/bookmark/${userId}`)
      .then((res) => setRecipes(res.data))
      .catch((err) => console.error('찜한 레시피 가져오기 실패:', err));
  }, [userId]);

  return (
    <>
      <Header />
      <div className="bookmark-grid">
        {recipes.map(recipe => (
          <BookmarkCard key={recipe.recipeId} recipe={recipe} userId={userId} />
        ))}
        <style jsx>{`
        .bookmark-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 20px;
          padding: 20px;
        }
      `}</style>
      </div>
      <BottomNavigation />
    </>
  );
}


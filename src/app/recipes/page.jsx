'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import styles from '../../styles/pages/Recipes.module.css';

export default function RecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 추천 레시피 데이터 가져오기
    const recommendedRecipes = localStorage.getItem('recommendedRecipes');
    if (recommendedRecipes) {
      setRecipes(JSON.parse(recommendedRecipes));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="mainContainer">
        <Header />
        <div className="appContainer">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh',
            fontSize: '18px'
          }}>
            레시피를 불러오는 중...
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="mainContainer">
      <Header />
      <div className="appContainer">
        <h1 className={styles.title}>추천 레시피</h1>
        <div className={styles.recipeGrid}>
          {recipes.length > 0 ? (
            recipes.map((recipe, index) => (
              <Link key={index} href={`/recipes/${recipe.recipeId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.recipeCard}>
                  <img 
                    src={recipe.imageUrl || '/images/default-recipe.jpg'} 
                    alt={recipe.name} 
                    className={styles.recipeImage}
                  />
                  <div className={styles.recipeInfo}>
                    <h3 className={styles.recipeName}>{recipe.name}</h3>
                    <p className={styles.recipeDescription}>{recipe.description}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className={styles.noRecipes}>
              <p>추천된 레시피가 없습니다.</p>
              <button 
                onClick={() => router.push('/refrigerator')}
                className={styles.backButton}
              >
                냉장고로 돌아가기
              </button>
            </div>
          )}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
} 
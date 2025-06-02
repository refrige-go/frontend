'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import BottomNavigation from '../../../components/layout/BottomNavigation';
import axiosInstance from '../../../api/axiosInstance';
import RecipeCard from '../../../components/RecipeCard';
import styles from '../../../styles/pages/RecipeDetail.module.css';

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [userIngredients, setUserIngredients] = useState([]);
  const [ingredientUsage, setIngredientUsage] = useState({});
  const [similarRecipes, setSimilarRecipes] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [displayCount, setDisplayCount] = useState(5);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
    }
    if (!storedToken) {
      alert("로그인 후 이용 가능합니다.");
      router.replace("/login");
      return;
    }
    axiosInstance.get("/secure/ping")
      .catch(() => {
        alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
        localStorage.removeItem('accessToken');
        router.replace("/login");
      });
  }, [router]);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${baseUrl}/api/recipe/${id}`, { headers });

        if (!res.ok) throw new Error('레시피 정보를 가져오는 데 실패했습니다.');
        const data = await res.json();
        setRecipe(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    if (id && token) fetchRecipe();
  }, [id, token, baseUrl]);

  // 사용자 냉장고 재료 조회
  useEffect(() => {
    async function fetchUserIngredients() {
      if (!token || !recipe) return;

      try {
        const response = await axiosInstance.get('/user-ingredients');
        setUserIngredients(response.data);
      } catch (error) {
        console.error('사용자 재료 조회 실패:', error);
      }
    }
    fetchUserIngredients();
  }, [token, recipe]);

  useEffect(() => {
    async function fetchSimilarRecipes() {
      try {
        if (!token) {
          setLoadingSimilar(false);
          return;
        }

        const response = await axiosInstance.get(`/api/recommendations/${id}/similar-ingredients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSimilarRecipes(response.data);
      } catch (error) {
        console.error('비슷한 레시피 로딩 실패:', error);
      } finally {
        setLoadingSimilar(false);
      }
    }

    if (id) {
      fetchSimilarRecipes();
    }
  }, [id, token, baseUrl]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
        setDisplayCount(prev => Math.min(prev + 5, similarRecipes.length));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [similarRecipes.length]);

  const handleStartCooking = () => {
    setIsCookingMode(true);
    // 초기 상태: 모든 재료를 "남음"으로 설정
    const initialUsage = {};
    userIngredients.forEach(ingredient => {
      initialUsage[ingredient.id] = 'remaining'; // 'remaining' or 'used'
    });
    setIngredientUsage(initialUsage);
  };

  const handleFinishCooking = async () => {
    try {
      // 사용된 재료들의 ID 수집
      const usedIngredientIds = Object.entries(ingredientUsage)
        .filter(([_, status]) => status === 'used')
        .map(([id, _]) => parseInt(id));

      if (usedIngredientIds.length === 0) {
        alert('사용된 재료가 없습니다.');
        return;
      }

      // 백엔드에 사용된 재료 업데이트 요청
      await axiosInstance.post('/user-ingredients/consume', {
        ingredientIds: usedIngredientIds,
        recipeId: id
      });

      alert('요리 완료! 사용된 재료가 냉장고에서 차감되었습니다.');
      setIsCookingMode(false);
      router.push('/refrigerator');
    } catch (error) {
      console.error('요리 완료 처리 실패:', error);
      alert('요리 완료 처리 중 오류가 발생했습니다.');
    }
  };

  const toggleIngredientUsage = (ingredientId) => {
    setIngredientUsage(prev => ({
      ...prev,
      [ingredientId]: prev[ingredientId] === 'remaining' ? 'used' : 'remaining'
    }));
  };

  const getMatchedIngredients = () => {
    if (!recipe || !userIngredients) return [];

    // 레시피 재료와 사용자 재료 매칭
    const recipeIngredients = recipe.RCP_PARTS_DTLS?.split(',').map(ing => ing.trim()) || [];
    return userIngredients.filter(userIng =>
      recipeIngredients.some(recipeIng =>
        recipeIng.includes(userIng.name) || userIng.name.includes(recipeIng)
      )
    );
  };

  const handleBookmarkChange = (recipeId) => {
    // 비슷한 레시피 목록에서 북마크된 레시피 제거
    setSimilarRecipes(prev =>
      prev.filter(recipe => recipe.recipeId !== recipeId)
    );
  };

  if (loading) {
    return (
      <div className={styles.mainContainer}>
        <div className={styles.navBar}>
          <button className={styles.backButton} onClick={() => router.back()}>
            ←
          </button>
          <h2 className={styles.navTitle}>레시피 상세</h2>
          <div style={{ width: '18px' }}></div>
        </div>

        <div className={styles.appContainer}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>레시피를 불러오는 중...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className={styles.mainContainer}>
        <div className={styles.navBar}>
          <button className={styles.backButton} onClick={() => router.back()}>
            ←
          </button>
          <h2 className={styles.navTitle}>레시피 상세</h2>
          <div style={{ width: '18px' }}></div>
        </div>

        <div className={styles.appContainer}>
          <div className={styles.errorMessage}>레시피를 찾을 수 없습니다.</div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.navBar}>
        <button className={styles.backButton} onClick={() => router.back()}>
          ←
        </button>
        <h2 className={styles.navTitle}>레시피 상세</h2>
        <button className={styles.startCookingButton} onClick={handleStartCooking}>
          요리 시작
        </button>
      </div>

      <div className={styles.appContainer}>
        {/* 요리 모드일 때 재료 사용 체크 */}
        {isCookingMode && (
          <div className={styles.cookingMode}>
            <h3 className={styles.cookingModeTitle}>🍳 요리 진행 중</h3>
            <p className={styles.cookingModeDescription}>
              사용한 재료를 체크해주세요. 요리 완료 후 냉장고에서 자동으로 차감됩니다.
            </p>

            <div className={styles.ingredientList}>
              {getMatchedIngredients().map(ingredient => (
                <div key={ingredient.id} className={styles.ingredientItem}>
                  <span className={styles.ingredientName}>{ingredient.name}</span>
                  <button
                    onClick={() => toggleIngredientUsage(ingredient.id)}
                    className={`${styles.ingredientButton} ${ingredientUsage[ingredient.id] === 'used' ? styles.used : ''
                      }`}
                  >
                    {ingredientUsage[ingredient.id] === 'used' ? '다씀' : '남음'}
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.buttonGroup}>
              <button className={styles.cancelButton} onClick={() => setIsCookingMode(false)}>
                취소
              </button>
              <button className={styles.completeButton} onClick={handleFinishCooking}>
                요리 완료
              </button>
            </div>
          </div>
        )}

        {/* 기존 레시피 상세 내용 */}
        <div className={styles.recipeHeader}>
          <h1 className={styles.recipeTitle}>{recipe.RCP_NM}</h1>
        </div>

        {recipe.ATT_FILE_NO_MAIN && (
          <div className={styles.mainImageContainer}>
            <Image
              src={recipe.ATT_FILE_NO_MAIN}
              alt={recipe.RCP_NM}
              width={500}
              height={300}
              className={styles.mainImage}
              priority
            />
          </div>
        )}

        <div className={styles.recipeInfo}>
          <div className={styles.infoCard}>
            <h2 className={styles.infoCardTitle}>기본 정보</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>요리 종류</span>
                <span className={styles.value}>{recipe.RCP_PAT2}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>조리 방법</span>
                <span className={styles.value}>{recipe.RCP_WAY2}</span>
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h2 className={styles.infoCardTitle}>영양 정보</h2>
            <div className={styles.nutritionGrid}>
              <div className={styles.nutritionItem}>
                <span className={styles.label}>칼로리</span>
                <span className={styles.value}>{recipe.INFO_ENG} kcal</span>
              </div>
              <div className={styles.nutritionItem}>
                <span className={styles.label}>탄수화물</span>
                <span className={styles.value}>{recipe.INFO_CAR}g</span>
              </div>
              <div className={styles.nutritionItem}>
                <span className={styles.label}>단백질</span>
                <span className={styles.value}>{recipe.INFO_PRO}g</span>
              </div>
              <div className={styles.nutritionItem}>
                <span className={styles.label}>지방</span>
                <span className={styles.value}>{recipe.INFO_FAT}g</span>
              </div>
              <div className={styles.nutritionItem}>
                <span className={styles.label}>나트륨</span>
                <span className={styles.value}>{recipe.INFO_NA}mg</span>
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h2 className={styles.infoCardTitle}>재료</h2>
            <p className={styles.ingredients}>{recipe.RCP_PARTS_DTLS}</p>
          </div>
        </div>

        <div className={styles.cookSteps}>
          <div className={styles.infoCard}>
            <h2 className={styles.infoCardTitle}>조리 순서</h2>
            {Array.from({ length: 20 }).map((_, i) => {
              const stepKey = `MANUAL${String(i + 1).padStart(2, '0')}`;
              const imgKey = `MANUAL_IMG${String(i + 1).padStart(2, '0')}`;
              const rawStep = recipe[stepKey];
              const img = recipe[imgKey];
              const cleanedStep = rawStep?.replace(/^\d+\.\s*/, "");

              return rawStep ? (
                <div key={i} className={styles.step}>
                  <div className={styles.stepNumber}>{i + 1}</div>
                  <div className={styles.stepContent}>
                    <p>{cleanedStep}</p>
                    {img && (
                      <div className={styles.stepImageContainer}>
                        <Image
                          src={img}
                          alt={`Step ${i + 1}`}
                          width={400}
                          height={250}
                          className={styles.stepImage}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* 비슷한 레시피 섹션 */}
        {!loadingSimilar && similarRecipes.length > 0 && (
          <div className={styles.similarRecipesSection}>
            <h2 className={styles.similarRecipesTitle}>비슷한 재료를 사용한 레시피</h2>
            <div className={styles.similarRecipesGrid}>
              {similarRecipes.slice(0, displayCount).map((similarRecipe) => (
                <RecipeCard
                  key={similarRecipe.recipeId}
                  recipe={{
                    ...similarRecipe,
                    rcpNm: similarRecipe.recipeNm || similarRecipe.RCP_NM || similarRecipe.rcpNm
                  }}
                  onUnbookmark={handleBookmarkChange}
                />
              ))}
            </div>
            {displayCount < similarRecipes.length && (
              <div className={styles.scrollMessage}>
                스크롤을 내려 더 많은 레시피를 확인하세요
              </div>
            )}
          </div>
        )}

        {/* 하단 요리 시작하기 버튼 */}
        {!isCookingMode && (
          <div className={styles.bottomButton}>
            <button className={styles.startCookingBottomButton} onClick={handleStartCooking}>
              🍳 요리 시작하기
            </button>
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}
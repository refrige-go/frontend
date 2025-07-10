'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import BottomNavigation from '../../../components/layout/BottomNavigation';
import axiosInstance from '../../../api/axiosInstance';
import RecipeCard from '../../../components/RecipeCard';
import styles from '../../../styles/pages/RecipeDetail.module.css';
import SubPageHeader from '../../../components/layout/SubPageHeader';

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

  // D-Day 계산 함수
  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `D+${Math.abs(diffDays)}`;
    if (diffDays === 0) return 'D-Day';
    return `D-${diffDays}`;
  };

  if (loading) {
    return (
      <div className="mainContainer">
        <SubPageHeader title="레시피 상세" onBack={() => router.back()} />

        <div className={`${styles.appContainer} ${isCookingMode ? styles.cookingModeActive : ''}`}>
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
      <div className="mainContainer">
        <SubPageHeader title="레시피 상세" onBack={() => router.back()} />

        <div className={`${styles.appContainer} ${isCookingMode ? styles.cookingModeActive : ''}`}>
          <div className={styles.errorMessage}>레시피를 찾을 수 없습니다.</div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="mainContainer">
      <SubPageHeader title="레시피 상세" onBack={() => router.back()} />
      <div className="appContainer" style={{ paddingTop: '70px', paddingBottom: '80px' }}>
        {/* 요리 모드일 때 재료 사용 체크 - header 바로 아래에 고정 위치 */}
        {isCookingMode && (
          <div className={styles.cookingModeFixed}>
            <div className={styles.cookingMode}>
              <h3 className={styles.cookingModeTitle}>🍳 요리 진행 중</h3>
              <p className={styles.cookingModeDescription}>
                사용한 재료를 체크해주세요. 요리 완료 후 냉장고에서 자동으로 차감됩니다.
              </p>

              <div className={styles.ingredientList}>
                {getMatchedIngredients().map(ingredient => (
                  <div key={ingredient.id} className={styles.ingredientItem}>
                    <div className={styles.ingredientInfo}>
                      <span className={styles.ingredientName}>{ingredient.name}</span>
                      {ingredient.expiryDate && (
                        <span className={styles.ingredientDday}>
                          {getDaysRemaining(ingredient.expiryDate)}
                        </span>
                      )}
                    </div>
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
          </div>
        )}

        {/* 레시피 전체 컨텐츠 영역 */}
        <div className={styles.recipeContentContainer}>
          {/* 레시피 기본 정보 영역 - 제목, 사진, 기본정보, 영양정보를 하나로 통합 */}
          <div className={styles.recipeOverview}>
            <h1 className={styles.recipeTitle}>{recipe.RCP_NM}</h1>
            
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

            <div className={styles.recipeInfoContainer}>
              <div className={styles.basicInfoRow}>
                <div className={styles.basicInfoItem}>
                  <span className={styles.label}>요리 종류</span>
                  <span className={styles.value}>{recipe.RCP_PAT2}</span>
                </div>
                <div className={styles.basicInfoItem}>
                  <span className={styles.label}>조리 방법</span>
                  <span className={styles.value}>{recipe.RCP_WAY2}</span>
                </div>
              </div>

              <div className={styles.nutritionCompact}>
                <h3 className={styles.sectionTitle}>영양 정보</h3>
                <div className={styles.nutritionRow}>
                  <div className={styles.nutritionItem}>
                    <span className={styles.nutritionLabel}>칼로리</span>
                    <span className={styles.nutritionValue}>{recipe.INFO_ENG} kcal</span>
                  </div>
                  <div className={styles.nutritionItem}>
                    <span className={styles.nutritionLabel}>탄수화물</span>
                    <span className={styles.nutritionValue}>{recipe.INFO_CAR}g</span>
                  </div>
                  <div className={styles.nutritionItem}>
                    <span className={styles.nutritionLabel}>단백질</span>
                    <span className={styles.nutritionValue}>{recipe.INFO_PRO}g</span>
                  </div>
                  <div className={styles.nutritionItem}>
                    <span className={styles.nutritionLabel}>지방</span>
                    <span className={styles.nutritionValue}>{recipe.INFO_FAT}g</span>
                  </div>
                  <div className={styles.nutritionItem}>
                    <span className={styles.nutritionLabel}>나트륨</span>
                    <span className={styles.nutritionValue}>{recipe.INFO_NA}mg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 재료 영역 */}
          <div className={styles.ingredientsSection}>
            <h2 className={styles.sectionMainTitle}>🥬 재료</h2>
            <div className={styles.ingredientsContent}>
              <div className={styles.ingredientTags}>
                {recipe.RCP_PARTS_DTLS && recipe.RCP_PARTS_DTLS.split(',').map((ingredient, index) => (
                  <div key={index} className={styles.ingredientTag}>
                    <span className={styles.ingredientTagText}>{ingredient.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 조리 순서 */}
          <div className={styles.cookStepsSection}>
            <h2 className={styles.sectionMainTitle}>👩‍🍳 조리 순서</h2>
            <div className={styles.cookSteps}>
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
          </div>
        )}

        {/* 하단 여백 */}
        <div className={styles.bottomSpacing}></div>

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
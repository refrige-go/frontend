'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import BottomNavigation from '../../../components/layout/BottomNavigation';
import axiosInstance from '../../../api/axiosInstance';

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

  if (loading) {
    return (
      <div className="mainContainer">
        {/* 상단 네비게이션 바 */}
        <div style={{
          width: '420px',
          height: '70px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          boxSizing: 'border-box',
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <button 
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            margin: 0
          }}>
            레시피 상세
          </h2>
          <div style={{ width: '18px' }}></div>
        </div>

        <div className="appContainer" style={{ paddingTop: '70px' }}>
          <div className="loading-container">
            <div className="loading-spinner"></div>
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
        {/* 상단 네비게이션 바 */}
        <div style={{
          width: '420px',
          height: '70px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          boxSizing: 'border-box',
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <button 
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            margin: 0
          }}>
            레시피 상세
          </h2>
          <div style={{ width: '18px' }}></div>
        </div>

        <div className="appContainer" style={{ paddingTop: '70px' }}>
          <div className="error-message">레시피를 찾을 수 없습니다.</div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="mainContainer">
      {/* 상단 네비게이션 바 */}
      <div style={{
        width: '420px',
        height: '70px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        boxSizing: 'border-box',
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <button 
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          ←
        </button>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          margin: 0
        }}>
          레시피 상세
        </h2>
        <button
          onClick={handleStartCooking}
          style={{
            background: '#f97316',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          요리 시작
        </button>
      </div>

      <div className="appContainer" style={{ paddingTop: '70px' }}>
        {/* 요리 모드일 때 재료 사용 체크 */}
        {isCookingMode && (
          <div style={{
            background: '#e6fff2',
            padding: '1rem',
            borderRadius: '12px',
            margin: '1rem 0',
            border: '2px solid #22c55e'
          }}>
            <h3 style={{ color: '#22c55e', margin: '0 0 1rem 0' }}>🍳 요리 진행 중</h3>
            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 1rem 0' }}>
              사용한 재료를 체크해주세요. 요리 완료 후 냉장고에서 자동으로 차감됩니다.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {getMatchedIngredients().map(ingredient => (
                <div 
                  key={ingredient.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{ingredient.name}</span>
                  <button
                    onClick={() => toggleIngredientUsage(ingredient.id)}
                    style={{
                      background: ingredientUsage[ingredient.id] === 'used' ? '#f97316' : '#e0e0e0',
                      color: ingredientUsage[ingredient.id] === 'used' ? 'white' : '#666',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '6px 12px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {ingredientUsage[ingredient.id] === 'used' ? '다씀' : '남음'}
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={() => setIsCookingMode(false)}
                style={{
                  flex: 1,
                  background: '#e0e0e0',
                  color: '#666',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handleFinishCooking}
                style={{
                  flex: 1,
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                요리 완료
              </button>
            </div>
          </div>
        )}

        {/* 기존 레시피 상세 내용 */}
        <div className="recipe-header">
          <h1>{recipe.RCP_NM}</h1>
        </div>

        {recipe.ATT_FILE_NO_MAIN && (
          <div className="main-image-container">
            <Image
              src={recipe.ATT_FILE_NO_MAIN}
              alt={recipe.RCP_NM}
              width={500}
              height={300}
              className="main-image"
              priority
            />
          </div>
        )}

        <div className="recipe-info">
          <div className="info-card">
            <h2>기본 정보</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">요리 종류</span>
                <span className="value">{recipe.RCP_PAT2}</span>
              </div>
              <div className="info-item">
                <span className="label">조리 방법</span>
                <span className="value">{recipe.RCP_WAY2}</span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h2>영양 정보</h2>
            <div className="nutrition-grid">
              <div className="nutrition-item">
                <span className="label">칼로리</span>
                <span className="value">{recipe.INFO_ENG} kcal</span>
              </div>
              <div className="nutrition-item">
                <span className="label">탄수화물</span>
                <span className="value">{recipe.INFO_CAR}g</span>
              </div>
              <div className="nutrition-item">
                <span className="label">단백질</span>
                <span className="value">{recipe.INFO_PRO}g</span>
              </div>
              <div className="nutrition-item">
                <span className="label">지방</span>
                <span className="value">{recipe.INFO_FAT}g</span>
              </div>
              <div className="nutrition-item">
                <span className="label">나트륨</span>
                <span className="value">{recipe.INFO_NA}mg</span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h2>재료</h2>
            <p className="ingredients">{recipe.RCP_PARTS_DTLS}</p>
          </div>
        </div>

        <div className="cook-steps">
          <div className="info-card">
            <h2>조리 순서</h2>
            {Array.from({ length: 20 }).map((_, i) => {
              const stepKey = `MANUAL${String(i + 1).padStart(2, '0')}`;
              const imgKey = `MANUAL_IMG${String(i + 1).padStart(2, '0')}`;
              const rawStep = recipe[stepKey];
              const img = recipe[imgKey];
              const cleanedStep = rawStep?.replace(/^\d+\.\s*/, "");

              return rawStep ? (
                <div key={i} className="step">
                  <div className="step-number">{i + 1}</div>
                  <div className="step-content">
                    <p>{cleanedStep}</p>
                    {img && (
                      <div className="step-image-container">
                        <Image
                          src={img}
                          alt={`Step ${i + 1}`}
                          width={400}
                          height={250}
                          className="step-image"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>

        {recipe.HASH_TAG && (
          <div className="hashtags">
            {recipe.HASH_TAG.split(',').map((tag, index) => (
              <span key={index} className="hashtag">#{tag.trim()}</span>
            ))}
          </div>
        )}

        {recipe.RCP_NA_TIP && (
          <div className="tip-box">
            <h3>요리 TIP</h3>
            <p>{recipe.RCP_NA_TIP}</p>
          </div>
        )}

        {/* 하단 요리 시작하기 버튼 */}
        {!isCookingMode && (
          <div style={{
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '380px',
            padding: '0 20px',
            zIndex: 100
          }}>
            <button
              onClick={handleStartCooking}
              style={{
                width: '100%',
                background: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
              }}
            >
              🍳 요리 시작하기
            </button>
          </div>
        )}
      </div>
      <BottomNavigation />

      {/* 기존 스타일 */}
      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
        }

        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #f59e42;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .recipe-header {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 10px;
          margin-bottom: 20px;
        }

        h1 {
          font-size: 2rem;
          color: #333;
          margin: 0;
        }

        .main-image-container {
          margin: 20px 0;
          border-radius: 15px;
          overflow: hidden;
        }

        .main-image {
          width: 100%;
          height: auto;
          object-fit: cover;
        }

        .recipe-info {
          display: grid;
          gap: 20px;
          margin: 30px 0;
        }

        .info-card {
          background: white;
          border-radius: 15px;
          padding: 20px;
          border: 2px solid rgba(0, 0, 0, 0.05);
        }

        .info-card h2 {
          color: #f59e42;
          margin-bottom: 15px;
          font-size: 1.3rem;
        }

        .info-grid, .nutrition-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .info-item, .nutrition-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .label {
          color: #666;
          font-size: 0.9rem;
        }

        .value {
          color: #333;
          font-weight: 500;
        }

        .ingredients {
          line-height: 1.6;
          color: #444;
        }

        .cook-steps {
          margin: 40px 0;
        }

        .cook-steps h2 {
          color: #f59e42;
          margin-bottom: 20px;
          font-size: 1.5rem;
        }

        .step {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          background: white;
          border-radius: 15px;
          padding: 5px;
        }

        .step-number {
          background: #f59e42;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
          margin: auto;
        }

        .step-content {
          flex: 1;
        }

        .step-image-container {
          margin-top: 15px;
          border-radius: 10px;
          overflow: hidden;
        }

        .step-image {
          width: 100%;
          height: auto;
          object-fit: cover;
        }

        .hashtags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 20px 0;
        }

        .hashtag {
          background: #e9ecef;
          color: #495057;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .tip-box {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
        }

        .tip-box h3 {
          color: #856404;
          margin-bottom: 10px;
        }

        .tip-box p {
          color: #666;
          line-height: 1.6;
        }

        .error-message {
          text-align: center;
          color: #dc3545;
          padding: 20px;
          font-size: 1.2rem;
        }
      `}</style>
    </div>
  );
}
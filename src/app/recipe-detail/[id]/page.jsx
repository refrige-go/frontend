'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../../../components/layout/Header';
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


  useEffect(() => {
    async function fetchRecipe() {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(`${baseUrl}/api/recipe/${id}`, {
          headers
        });

        if (!res.ok) throw new Error('레시피 정보를 가져오는 데 실패했습니다.');
        const data = await res.json();
        setRecipe(data);
        setIsBookmarked(data.bookmarked || false);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchRecipe();
  }, [id]);

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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>레시피를 불러오는 중...</p>
      </div>
    );
  }

  if (!recipe) {
    return <div className="error-message">레시피를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="mainContainer">
      <Header />
      <div className="appContainer">
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
      </div>
      <BottomNavigation />

      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
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

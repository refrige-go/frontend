'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/layout/Header';
import BottomNavigation from '../../../components/layout/BottomNavigation';
import RecipeCard from '../../../components/RecipeCard';
import axiosInstance from '../../../api/axiosInstance';

export default function CategoryPage() {
  const router = useRouter();
  const { category: encodedCategory } = useParams();
  const category = encodedCategory ? decodeURIComponent(encodedCategory) : '';
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [token, setToken] = useState(null);
  const size = 5;

  const categories = [
    '한식', '양식', '중식', '일식', '태국식', '멕시코식',
    '중동식', '인도식', '스페인식', '다이어트식', '영유아식', '기타',
  ];

  // 각 버튼 ref 저장용
  const categoryRefs = useRef({});

  // 슬라이더 드래그 관련 refs
  const sliderRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

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
    setPage(0);
    // 선택된 카테고리 버튼 스크롤로 보이게 하기
    if (category && categoryRefs.current[category]) {
      categoryRefs.current[category].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [category]);

  useEffect(() => {
    if (!category) return;

    setLoading(true);

    // axiosInstance를 사용하면 자동으로 Authorization 헤더가 추가됩니다
    axiosInstance.get(`api/recipe/category/${category}?page=${page}&size=${size}`)
      .then(response => {
        const data = response.data;
        setRecipes(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      })
      .catch(error => {
        console.error('레시피 조회 실패:', error);
        setRecipes([]);
        setTotalPages(0);
        setTotalElements(0);
      })
      .finally(() => setLoading(false));
  }, [category, page]); // token 의존성 제거 (axiosInstance가 자동으로 토큰 처리)

  const getPageNumbers = () => {
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(0, page - half);
    let end = start + maxButtons;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(0, end - maxButtons);
    }
    return Array.from({ length: end - start }, (_, i) => start + i);
  };

  // 마우스 드래그 이벤트 핸들러
  const onMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
    sliderRef.current.style.cursor = 'grabbing';
  };

  const onMouseLeave = () => {
    isDragging.current = false;
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
    }
  };

  const onMouseUp = () => {
    isDragging.current = false;
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
    }
  };

  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1; // 속도 조절 가능
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <div className="mainContainer">
      <Header />
      <div className="appContainer">
        <main style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
          {loading ? (
            <p>불러오는 중...</p>
          ) : recipes.length === 0 ? (
            <p>해당 카테고리의 레시피가 없습니다.</p>
          ) : (
            <>
              {/* 카테고리 슬라이드 */}
              <div
                className="categorySlider"
                ref={sliderRef}
                onMouseDown={onMouseDown}
                onMouseLeave={onMouseLeave}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                style={{ cursor: 'grab' }}
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    ref={(el) => (categoryRefs.current[cat] = el)}
                    onClick={() => {
                      if (cat !== category) router.push(`/category/${encodeURIComponent(cat)}`);
                    }}
                    className={`categoryButton ${cat === category ? 'selected' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="recipesGrid">
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.recipeNm}
                    recipe={{
                      rcpNm: recipe.recipeNm,
                      rcpSeq: recipe.rcpSeq,
                      image: recipe.image,
                      rcpPartsDtls: recipe.rcpPartsDtls,
                      cuisineType: recipe.cuisineType,
                      rcpWay2: recipe.rcpWay2,
                      bookmarked: recipe.bookmarked,
                    }}
                    token={token}

                  />
                ))}
              </div>

              {/* 페이지네이션 */}
              <div className="pagination">
                <button
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                  className="pageButton"
                  aria-label="처음 페이지"
                >
                  처음
                </button>

                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  disabled={page === 0}
                  className="pageButton"
                  aria-label="이전 페이지"
                >
                  ◀
                </button>

                {getPageNumbers().map((num) => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`pageButton ${page === num ? 'active' : ''}`}
                    aria-current={page === num ? 'page' : undefined}
                  >
                    {num + 1}
                  </button>
                ))}

                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                  disabled={page === totalPages - 1}
                  className="pageButton"
                  aria-label="다음 페이지"
                >
                  ▶
                </button>

                <button
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page === totalPages - 1}
                  className="pageButton"
                  aria-label="마지막 페이지"
                >
                  끝
                </button>
              </div>
            </>
          )}
        </main>
      </div>
      <BottomNavigation />

      <style jsx>{`
        .categorySlider {
          display: flex;
          overflow-x: auto;
          gap: 8px;
          white-space: nowrap;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE 10+ */
          user-select: none; /* 드래그 중 텍스트 선택 방지 */
        }
        .categorySlider::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        .categoryButton {
          border: none;
          background-color: #f0f0f0;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background-color 0.3s, color 0.3s;
          white-space: nowrap;
          user-select: none; /* 버튼 텍스트 선택 방지 */
        }
        .categoryButton.selected {
          background-color: #f59e42;
          color: white;
          font-weight: bold;
        }
        .recipesGrid {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-start;
          gap: 20px;
          margin-top: 24px;
        }
        .pagination {
          margin-top: 2rem;
          text-align: center;
        }
        .pageButton {
          margin: 0 2px;
          padding: 8px 8px;
          background-color: #eee;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s, color 0.3s;
        }
        .pageButton:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        .pageButton.active {
          background-color: #f59e42;
          color: #fff;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
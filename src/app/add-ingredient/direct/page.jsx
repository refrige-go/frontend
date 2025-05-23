// src/app/add-ingredient/page.jsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useIngredients } from '../../hooks/useIngredients';
import { authUtils } from '../../lib/api';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import styles from '../../styles/pages/AddIngredient.module.css';

export default function AddIngredientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ingredientId = searchParams.get('ingredientId') || null;
  
  const { addIngredient, loading, error, clearError } = useIngredients();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    ingredientId: ingredientId ? parseInt(ingredientId) : null,
    customName: '',
    purchaseDate: new Date(),
    expiryDate: null,
    isFrozen: false,
    customCategory: '',
  });

  // 에러 표시
  useEffect(() => {
    if (error) {
      alert(error);
      clearError();
    }
  }, [error, clearError]);

  // 폼 입력 변경 처리
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 날짜 변경 처리
  const handleDateChange = (date, field) => {
    setForm((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

  // 폼 유효성 검증
  const validateForm = () => {
    if (!form.ingredientId && !form.customName.trim()) {
      alert('재료 ID를 입력하거나 직접 재료명을 입력해주세요.');
      return false;
    }

    if (form.ingredientId && form.customName.trim()) {
      alert('재료 ID와 직접 입력은 동시에 사용할 수 없습니다. 하나만 선택해주세요.');
      return false;
    }

    if (!form.purchaseDate) {
      alert('구매일자를 선택해주세요.');
      return false;
    }

    if (!form.isFrozen && !form.expiryDate) {
      alert('냉동 보관이 아닌 경우 소비기한을 설정해주세요.');
      return false;
    }

    if (!form.ingredientId && !form.customCategory.trim()) {
      alert('직접 입력하는 재료의 경우 카테고리를 입력해주세요.');
      return false;
    }

    return true;
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // 데이터 준비
      const ingredientData = {
        ingredientId: form.ingredientId,
        customName: form.ingredientId ? null : form.customName.trim(),
        purchaseDate: form.purchaseDate,
        expiryDate: form.isFrozen ? null : form.expiryDate,
        isFrozen: form.isFrozen,
        customCategory: form.ingredientId ? null : form.customCategory.trim(),
      };

      console.log('재료 추가 데이터:', ingredientData);

      const success = await addIngredient(ingredientData);
      
      if (success) {
        alert('재료가 성공적으로 추가되었습니다!');
        router.push('/refrigerator');
      }
      
    } catch (error) {
      console.error('재료 추가 실패:', error);
      alert('재료 추가 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 취소 버튼 처리
  const handleCancel = () => {
    if (confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
      router.back();
    }
  };

  // 로딩 상태
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
            로딩 중...
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="mainContainer">
      <Header />
      <div className="appContainer" style={{ padding: '1rem' }}>
        
        {/* 헤더 */}
        <div style={{ marginBottom: '2rem' }}>
          <button 
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            ← 
          </button>
          
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            marginBottom: '0.5rem',
            color: '#333'
          }}>
            재료 추가
          </h1>
          
          <p style={{ 
            fontSize: '14px', 
            color: '#666',
            margin: 0
          }}>
            냉장고에 추가할 재료 정보를 입력해주세요.
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 재료 정보 */}
          <div style={{
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: '#333'
            }}>
              재료 정보
            </h3>
            
            {/* 재료 ID (기준 재료) */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#555'
              }}>
                재료 ID (기준 재료 사용시)
              </label>
              <input
                type="number"
                name="ingredientId"
                value={form.ingredientId || ''}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  ingredientId: e.target.value ? parseInt(e.target.value) : null,
                  customName: e.target.value ? '' : prev.customName // ID 입력 시 커스텀명 초기화
                }))}
                placeholder="예: 1 (기준 재료 ID)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* 또는 구분선 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1rem 0',
              color: '#999'
            }}>
              <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
              <span style={{ margin: '0 1rem', fontSize: '14px' }}>또는</span>
              <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
            </div>

            {/* 직접 입력 */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#555'
              }}>
                재료명 직접 입력
              </label>
              <input
                type="text"
                name="customName"
                value={form.customName}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  customName: e.target.value,
                  ingredientId: e.target.value ? null : prev.ingredientId // 커스텀명 입력 시 ID 초기화
                }))}
                placeholder="예: 마라탕 육수, 직접 만든 소스 등"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* 카테고리 (직접 입력 시에만) */}
            {!form.ingredientId && form.customName && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: '#555'
                }}>
                  카테고리
                </label>
                <select
                  name="customCategory"
                  value={form.customCategory}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'white'
                  }}
                >
                  <option value="">카테고리 선택</option>
                  <option value="채소">채소</option>
                  <option value="육류">육류</option>
                  <option value="해산물">해산물</option>
                  <option value="유제품">유제품</option>
                  <option value="곡물">곡물</option>
                  <option value="조미료">조미료</option>
                  <option value="음료">음료</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            )}
          </div>

          {/* 날짜 정보 */}
          <div style={{
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: '#333'
            }}>
              날짜 정보
            </h3>

            {/* 구매일자 */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#555'
              }}>
                구매일자 *
              </label>
              <DatePicker
                selected={form.purchaseDate}
                onChange={(date) => handleDateChange(date, 'purchaseDate')}
                dateFormat="yyyy년 MM월 dd일"
                locale={ko}
                withPortal
                portalId="root-portal"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* 소비기한 */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#555'
              }}>
                소비기한 {!form.isFrozen && '*'}
              </label>
              <DatePicker
                selected={form.expiryDate}
                onChange={(date) => handleDateChange(date, 'expiryDate')}
                dateFormat="yyyy년 MM월 dd일"
                locale={ko}
                withPortal
                portalId="root-portal"
                disabled={form.isFrozen}
                placeholderText={form.isFrozen ? "냉동 보관 시 자동 설정" : "소비기한을 선택하세요"}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  background: form.isFrozen ? '#f5f5f5' : 'white'
                }}
              />
            </div>

            {/* 냉동 보관 여부 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              background: '#fff',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#555'
              }}>
                <input
                  type="checkbox"
                  name="isFrozen"
                  checked={form.isFrozen}
                  onChange={handleChange}
                  style={{
                    marginRight: '0.5rem',
                    transform: 'scale(1.2)'
                  }}
                />
                냉동실 보관 ❄️
              </label>
              {form.isFrozen && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '12px',
                  color: '#ff6600',
                  fontWeight: '500'
                }}>
                  소비기한 자동 해제
                </span>
              )}
            </div>
          </div>

          {/* 버튼 */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#fff',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1
              }}
            >
              취소
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 2,
                padding: '0.75rem',
                background: isSubmitting ? '#ccc' : '#ff6600',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {isSubmitting ? '추가 중...' : '재료 추가'}
            </button>
          </div>
        </form>

        {/* 안내 메시지 */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#fff6ee',
          borderRadius: '8px',
          border: '1px solid #ffd6b8'
        }}>
          <h4 style={{ 
            fontSize: '14px', 
            fontWeight: 'bold', 
            marginBottom: '0.5rem',
            color: '#ff6600'
          }}>
            💡 사용 방법
          </h4>
          <ul style={{ 
            fontSize: '12px', 
            color: '#666',
            margin: 0,
            paddingLeft: '1rem'
          }}>
            <li>기준 재료 ID 또는 직접 입력 중 하나만 선택하세요</li>
            <li>냉동 보관 시 소비기한은 자동으로 해제됩니다</li>
            <li>직접 입력 시 카테고리를 반드시 선택해주세요</li>
          </ul>
        </div>

      </div>
      <BottomNavigation />
    </div>
  );
}
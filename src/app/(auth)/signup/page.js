'use client';

import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/layout/Header';
import BottomNavigation from '../../../components/layout/BottomNavigation';
import "../../../styles/pages/signup.css"

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

export default function SignupPage() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    // JoinDTO에 맞는 필드 추가 (예: email 등)
    // email: '',
  });

  // 에러 상태 추가
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // 실시간 유효성 검사
  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        if (!value.trim()) return '아이디는 필수 입력값입니다.';
        if (value.length < 4) return '아이디는 4자 이상이어야 합니다.';
        if (value.length > 20) return '아이디는 20자 이하여야 합니다.';
        if (!/^[a-zA-Z0-9]+$/.test(value)) return '아이디는 영문과 숫자만 사용 가능합니다.';
        break;

      case 'password':
        if (!value.trim()) return '비밀번호는 필수 입력값입니다.';
        if (value.length < 4) return '비밀번호는 4자 이상이어야 합니다.';
        if (!/^[A-Za-z\d@$!%*?&]+$/.test(value)) return '비밀번호는 영문, 숫자, 특수문자(@$!%*?&)만 사용 가능합니다.';
        break;

      case 'nickname':
        if (!value.trim()) return '닉네임은 필수 입력값입니다.';
        if (value.length < 2) return '닉네임은 2자 이상이어야 합니다.';
        if (value.length > 15) return '닉네임은 15자 이하여야 합니다.';
        break;
    }
    return '';
  };

  // 비밀번호 일치 확인
  const validatePasswordMatch = (password, confirmPassword) => {
    if (confirmPassword && password !== confirmPassword) {
      return '비밀번호가 일치하지 않습니다.';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // 실시간 유효성 검사
    const error = validateField(name, value);

    // 비밀번호 확인 실시간 검사
    let confirmPasswordError = '';
    if (name === 'confirmPassword' || name === 'password') {
      const newPassword = name === 'password' ? value : form.password;
      const newConfirmPassword = name === 'confirmPassword' ? value : form.confirmPassword;
      confirmPasswordError = validatePasswordMatch(newPassword, newConfirmPassword);
    }
    
    setErrors(prev => ({ 
      ...prev, 
      [name]: error,
      ...(name === 'confirmPassword' || name === 'password' ? { confirmPassword: confirmPasswordError } : {})
    }));
  };

  // 전체 폼에 대해 유효성 검사
  const validateForm = () => {
    const newErrors = {};
    
    // 각 필드 검사
    Object.keys(form).forEach(field => {
      if (field !== 'confirmPassword') {
        const error = validateField(field, form[field]);
        if (error) newErrors[field] = error;
      }
    });  

    // 비밀번호 확인 검사
    const confirmPasswordError = validatePasswordMatch(form.password, form.confirmPassword);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

            const handleSubmit = async (e) => {
              e.preventDefault();    

              // 클라이언트 측 유효성 검사
              if (!validateForm()) {
                return;
              }
              
              setIsSubmitting(true);
              setErrors({}); 
              
              try {
                // confirmPassword는 서버로 보내지 않음
                const { confirmPassword, ...submitData } = form;

                // /join 엔드포인트로 POST 요청 (JSON body)
                const res = await axios.post(`${baseUrl}/join`, submitData, {
                  headers: { 'Content-Type': 'application/json' }
                });

                alert(res.data); // "회원가입이 완료되었습니다." 메시지

                // 회원가입 성공 후 로그인 페이지로 이동
                router.push('/login');
              } catch (err) {
                console.error('회원가입 에러:', err);

                if (err.response?.status === 400) {
                  // 백엔드 유효성 검사 에러 처리
                  const errorMessage = err.response.data;
                  
                  if (typeof errorMessage === 'string') {
                    // 에러 메시지 파싱
                    const parsedErrors = parseValidationErrors(errorMessage);
                    setErrors(parsedErrors);
                  } else {
                    setErrors({ general: '회원가입에 실패했습니다.' });
                  }
                } else {
                  setErrors({ general: '서버 오류가 발생했습니다.' });
                }
              } finally {
                setIsSubmitting(false);
              }
            };
            
            // 백엔드 에러 메시지 파싱 함수
            const parseValidationErrors = (errorString) => {
              const errors = {};
              
              // "아이디는 4자 이상 20자 이하여야 합니다.; 비밀번호는 8자 이상 20자 이하여야 합니다.; "
              const errorMessages = errorString.split('\n').filter(msg => msg.trim());
              
              errorMessages.forEach(message => {
                if (message.includes('아이디')) {
                  errors.username = message;
                } else if (message.includes('비밀번호')) {
                  errors.password = message;
                } else if (message.includes('닉네임')) {
                  errors.nickname = message;
                } else {
                  errors.general = message;
                }
              });
              
              return errors;
            };

            return (
              <div className="mainContainer">
                <Header />
                <div className="appContainer singup">
                  <div>
                    <h1>회원가입</h1>

                    {/* 일반 에러 메시지 */}
                    {errors.general && (
                      <div className="error-message general">
                        {errors.general}
                      </div>
                    )}

          <form onSubmit={handleSubmit}>
            {/* 아이디 */}
            <div className="form-field">
              <label htmlFor="username">
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="아이디"
                  required 
                  className={errors.username ? 'error' : (form.username && !errors.username ? 'valid' : '')}
                />
                <span>아이디</span>
              </label>
              {/* 아이디 에러 메시지 */}
              {errors.username && <div className="error-message">{errors.username}</div>}
            </div>
                        
            <div className="password-group">
                {/* 비밀번호 */}
                <div className="form-field no-margin">
                  <label htmlFor="password">
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="비밀번호"
                      required 
                      className={errors.password ? 'error' : (form.password && !errors.password ? 'valid' : '')}
                    />
                    <span>비밀번호</span>
                  </label>
                </div>
                
                {/* 비밀번호 확인 */}
                <div className="form-field no-margin">
                  <label htmlFor="confirmPassword">
                    <input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="비밀번호 확인"
                      required 
                      className={errors.confirmPassword ? 'error' : (form.confirmPassword && !errors.confirmPassword ? 'valid' : '')}
                    />
                    <span>비밀번호 확인</span>
                  </label>
                </div>

                {/* 비밀번호 관련 에러/성공 메시지 모음 */}
                <div className="password-messages">
                  {errors.password && <div className="error-message">{errors.password}</div>}
                  {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                  {form.confirmPassword && form.password === form.confirmPassword && !errors.confirmPassword && (
                    <div className="success-message">✅ 비밀번호가 일치합니다.</div>
                  )}
                </div>
              </div>
            
            {/* 닉네임 */}
            <div className="form-field">
              <label htmlFor="nickname">
                <input
                  id="nickname"
                  type="text"
                  name="nickname"
                  value={form.nickname}
                  onChange={handleChange}
                  placeholder="닉네임"
                  required
                  className={errors.nickname ? 'error' : (form.nickname && !errors.nickname ? 'valid' : '')}
                />   
                <span>닉네임</span>
              </label>  
              {/* 닉네임 에러 메시지 - 바로 여기! */}
              {errors.nickname && <div className="error-message">{errors.nickname}</div>}
            </div>

            <button 
              className='btn-org' 
              type="submit" 
              disabled={
                isSubmitting || 
                Object.keys(errors).some(key => errors[key]) ||
                !form.username.trim() ||           // ← 아이디 비어있으면 비활성화
                !form.password.trim() ||           // ← 비밀번호 비어있으면 비활성화  
                !form.confirmPassword.trim() ||    // ← 비밀번호 확인 비어있으면 비활성화
                !form.nickname.trim()              // ← 닉네임 비어있으면 비활성화
              }
            >
              {isSubmitting ? '가입 중...' : '회원가입 완료'}
            </button>
          </form>

          <Link className='btn-gray' href="/">
            <button>이전</button>
          </Link>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
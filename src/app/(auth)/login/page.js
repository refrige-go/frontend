'use client';

import axios from 'axios';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/layout/Header';
import BottomNavigation from '../../../components/layout/BottomNavigation';
import "../../../styles/pages/login.css"


const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

export default function LoginPage() {
  console.log("LoginPage rendered!"); // 컴포넌트 렌더링

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit called!');
    setIsLoading(true);

    try {
      // 1. 로그인 요청
      const res = await axios.post(
        `${baseUrl}/login`,
        { username, password },
        { withCredentials: true }
      );

      // 2. authorization 헤더에서 Bearer 떼고 순수 토큰만 추출!
      const rawAuthorization = res.headers['authorization'];
      const accessToken = rawAuthorization?.replace('Bearer ', '');
      
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        console.log('Access token saved:', accessToken);
        
        // 3. 사용자 정보는 별도로 가져오지 않고, 토큰만 저장
        // userId는 토큰에서 추출하거나 다른 방식으로 처리
        // 임시로 사용자 이름을 userId로 사용
        localStorage.setItem('userId', username);
        localStorage.setItem('userInfo', JSON.stringify({ 
          userId: username, 
          nickname: username,
          username: username 
        }));
        
        console.log('User info saved (from username):', {
          userId: username,
          username: username
        });
      }
      
      // 4. 홈으로 이동
      router.push('/');
      
    } catch (err) {
      console.error('로그인 에러:', err);
      alert('로그인 실패');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mainContainer">
      <Header />
      <div className="appContainer login">
        <img src="/images/logo.svg" alt="logo" />
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">
            <input
              placeholder="아이디를 입력하세요."
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
            <span>아이디</span>
          </label>
          <label htmlFor="password">
            <input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <span>비밀번호</span>
          </label>
          <button className="loginBtn" type="submit" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <div className="authActionBox">
          <Link href="/signup"><span>회원가입</span></Link>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Next.js 13 이상에서는 'next/navigation'에서 가져옵니다
import Link from 'next/link';
import "../../../styles/pages/login.css"

export default function LoginPage() {
  const router = useRouter(); // 라우터 초기화

  const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

 // 로그인 페이지 들어오면 기존 토큰 제거 (만료된 토큰 방지용)
useEffect(() => {
  const token = localStorage.getItem('token');

  if (token) {
    // 로그인된 사용자는 로그인 페이지 접근 못 하게
    router.replace('/');
  } else {
    // 로그인 안 된 사용자라면 혹시 모를 이전 토큰 제거
    localStorage.removeItem('token');
  }
}, []);



  // 입력값 상태 관리
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 폼 제출 이벤트
  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 폼 제출 막기

    try {
      const response = await fetch(`${baseUrl}/login`, {  // 백엔드 로그인 API 주소
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),  // 백엔드 DTO에 맞춰서 보냄
      });

      if (!response.ok) {
        throw new Error('로그인 실패');
      }

      const data = await response.json(); // 토큰 등 응답 데이터 받기
      console.log('로그인 성공:', data);

      // 토큰 저장(예: localStorage)
      localStorage.setItem('token', data.token);

      // 로그인 성공 알림창 띄우기
      alert('로그인에 성공했습니다!');

      // 로그인 성공 후 루트 페이지로 이동
      router.push('/');

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="appContainer login">
      <img src="/images/logo.svg" alt="logo" />
      <form method="post" onSubmit={handleSubmit}>
        <label htmlFor="username">
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
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
          />
          <span>비밀번호</span>
        </label>
        <button type="submit">로그인</button>
      </form>
      <div className="socialBtns">
        <button>카카오로 계속하기</button>
        <button>Google로 계속하기</button>
      </div>
      <div className="authActionBox">
        <Link href="/signup"><span>회원가입</span></Link>
        <Link href="/browse"><span>냉장GO <span>둘러보기</span></span></Link>
      </div>
    </div>

  );
}
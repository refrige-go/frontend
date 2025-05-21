'use client';

import { useState } from 'react';

import Link from 'next/link';

// import "@/styles/pages/login.css"

export default function LoginPage() {
  // 입력값 상태 관리
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  // 폼 제출 이벤트
  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 폼 제출 막기

    try {
      const response = await fetch('/auth/login', {  // 백엔드 로그인 API 주소
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, password }),  // 백엔드 DTO에 맞춰서 보냄
      });

      if (!response.ok) {
        throw new Error('로그인 실패');
      }

      const data = await response.json(); // 토큰 등 응답 데이터 받기
      console.log('로그인 성공:', data);

      // 토큰 저장(예: localStorage)
      localStorage.setItem('token', data.token);

      // 로그인 성공 후 페이지 이동 등 처리

    } catch (error) {
      alert(error.message);
    }
  };


  return (
    <div className="appContainer login">
      <img src="/images/logo.svg" alt="logo" />
      <form action="post" onSubmit={handleSubmit}>
        <label htmlFor="userId"><input id="userId" type="text" value={userId} onChange={(e) => setUserId(e.target.value)} /><span>아이디</span></label>
        <label htmlFor="password"><input id="password" type="password" placeholder="비밀번호를 입력하세요." value={password}
          onChange={(e) => setPassword(e.target.value)} /><span>비밀번호</span></label>
        <button type="submit">로그인</button>
      </form>
      <div className="socialBtns">
        <button>카카오로 계속하기</button>
        <button>Google로 계속하기</button>
      </div>
      <div className="authActionBox">
        <span>회원가입</span>
        <span>냉장GO <span>둘러보기</span></span>
      </div>

    </div>

  );
}
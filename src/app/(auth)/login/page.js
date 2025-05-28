'use client';

import axios from 'axios';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Next.js 13 이상에서는 'next/navigation'에서 가져옵니다
import Link from 'next/link';
import "../../../styles/pages/login.css"


const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

export default function LoginPage() {
  console.log("LoginPage rendered!"); // 컴포넌트 렌더링

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit called!');

    try {
      const res = await axios.post(
        `${baseUrl}/login`,
        { username, password },
        { withCredentials: true }
      );

      // authorization 헤더에서 Bearer 떼고 순수 토큰만 추출!
      const rawAuthorization = res.headers['authorization'];
      const accessToken = rawAuthorization?.replace('Bearer ', '');
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      router.push('/');
    } catch (err) {
      alert('로그인 실패');
    }
  };

  return (
    <div className="mainContainer">
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
        <button className="loginBtn" type="submit">로그인</button>
      </form>
      <div className="socialBtns">
        <button>카카오로 계속하기</button>
        <button>Google로 계속하기</button>
      </div>
      <div className="authActionBox">
        <Link href="/signup"><span>회원가입</span></Link>
        <Link href="/"><span>둘러보기</span></Link>
      </div>
    </div>
    </div>
    

  );
}
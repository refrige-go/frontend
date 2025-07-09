
'use client';

import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';



import "../../../styles/pages/signup.css"

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

export default function SignupPage() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    nickname: '',
    // JoinDTO에 맞는 필드 추가 (예: email 등)
    // email: '',
  });

  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // /join 엔드포인트로 POST 요청 (JSON body)
      const res = await axios.post(
        `${baseUrl}/join`,
        form,
        { headers: { 'Content-Type': 'application/json' } }
      );
      alert(res.data); // "회원가입이 완료되었습니다." 메시지

      // 회원가입 성공 후 로그인 페이지로 이동
      router.push('/login');
    } catch (err) {
      const message = err?.response?.data || '회원가입 실패';
      alert(message);
    }
  };

  return (
    <div className="mainContainer">
      <div className="appContainer singup">
        <div>
          <h1>회원가입</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">
              <input
                id="username"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="아이디"
                required /><span>아이디</span></label>
                 <label htmlFor="username">
              <input
                id="nickname"
                type="text"
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
                placeholder="닉네임"
                required /><span>닉네임</span></label>
            <label htmlFor="password">
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="비밀번호"
                required /><span>비밀번호</span></label>
            <button className='btn-org' type="submit">회원가입 완료</button>
          </form>
          <Link className='btn-gray' href="/"> <button>이전</button></Link>
        </div>
      </div>
    </div>
  );
}
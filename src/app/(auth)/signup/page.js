
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import "@/styles/pages/signup.css"

export default function SignupPage() {
  const router = useRouter(); // 라우터 훅
   const [form, setForm] = useState({
    username: '',
    password: ''
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, password } = form;

    try {
      const res = await fetch(`${baseUrl}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        }),
      });

      const result = await res.text();
      alert(result);

       router.push('/login');
       
    } catch (err) {
      alert('서버 요청 실패 😢');
    }
  };
  return (
    <div className="appContainer singup">
        <div>
          <h1>회원가입</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username"><input id="username" type="text" onChange={handleChange} value={form.username} /><span>아이디</span></label>
            <label htmlFor="password"><input id="password" type="password" placeholder="비밀번호를 입력하세요." value={form.password} onChange={handleChange} /><span>비밀번호</span></label>
          <button type="submit">회원가입 완료</button>
          </form>

          
          <Link href="/"> <button className='btn-gray'>이전</button></Link>
        </div>
    
    </div>
   
  );
}
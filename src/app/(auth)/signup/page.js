
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import "@/styles/pages/signup.css"

export default function SignupPage() {
  const router = useRouter(); // 라우터 훅
   const [form, setForm] = useState({
    userId: '',
    userName: '',
    userPassword: '',  
    passwordCheck: '',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { userId, userName, userPassword } = form;

    try {
      const baseUrl = process.env.BASE_API_URL;
      const res = await fetch(`${baseUrl}/user/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userName,
          userPassword,
          role: 'USER', // 기본 권한
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
            <label htmlFor="userId"><input id="userId" type="text"  onChange={handleChange}  value={form.userId} /><span>아이디</span></label>
            <label htmlFor="userName"><input id="userName" type="text" onChange={handleChange} value={form.userName} /><span>이름</span></label>
            <label htmlFor="userPassword"><input id="userPassword" type="password" placeholder="비밀번호를 입력하세요." value={form.userPassword} onChange={handleChange} /><span>비밀번호</span></label>
            <label htmlFor="passwordCheck"><input id="passwordCheck" type="password" placeholder="비밀번호를 한번 더 입력하세요." value={form.passwordCheck} onChange={handleChange}/><span>비밀번호 확인</span></label>
          <button type="submit">회원가입 완료</button>
          </form>

          
          <Link href="/"> <button className='btn-gray'>이전</button></Link>
        </div>
    
    </div>
   
  );
}
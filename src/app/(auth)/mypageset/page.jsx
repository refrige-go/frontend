'use client';

import axiosInstance from "../../../api/axiosInstance";
import Header from '../../../components/layout/Header'
import BottomNavigation from '../../../components/layout/BottomNavigation'
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "../../../styles/pages/mypageset.css"

export default function MyPageSet() {
  const router = useRouter();

  useEffect(() => {

    // 토큰이 정상발급 되고있는지 console에서 확인하는 프론트코드 

    // 1. accessToken을 localStorage에서 가져온다
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      // 2. JWT의 payload 부분(가운데, .으로 구분된 두 번째) 추출
      const payloadBase64 = accessToken.split('.')[1];
      // 3. Base64 디코딩
      const payloadJson = atob(payloadBase64);
      // 4. JSON 파싱
      const payload = JSON.parse(payloadJson);

      // 5. exp(만료 시간)는 초 단위로, Date.now()는 ms 단위이니 비교할 땐 1000 곱하기
      const exp = payload.exp;
      const expDate = new Date(exp * 1000);

      console.log('AccessToken:', accessToken);
      console.log('만료시간(exp):', exp, '->', expDate.toLocaleString());
      console.log('현재시간:', new Date().toLocaleString());

      if (Date.now() >= exp * 1000) {
        console.log('만료됨!');
      } else {
        console.log('아직 유효함');
      }
    } else {
      console.log('accessToken이 없습니다!');
    }


    // 프론트에서 토큰을 검증하는 코드 (인증이 필요한 모든 페이지에 필수, axios 사용 )
    if (!accessToken) {
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

  // 로그아웃 버튼 핸들러 함수
  const handleLogout = async () => {
    try {
      // 1. 로그아웃 API 요청 (refresh 토큰은 쿠키로 자동 전송됨)
      await axiosInstance.post("/logout");
      // 2. 로컬스토리지 access 토큰 삭제
      localStorage.removeItem('accessToken');
      // 3. 홈으로 이동
      router.replace("/");
    } catch (error) {
      alert("로그아웃에 실패했습니다.");
    }
  };

  return (
    <div className="mainContainer">
      <Header />
      <div className="appContainer mypageset">
        <div className="profile">
          <div className="img"></div>
          <span>당당한배추겉절이</span>
        </div>
         <div className="edit-box">
          <h1>회원정보 수정</h1>
          <form id="editForm" >
            <label htmlFor="username">
              <input
                id="username"
                type="text"
                name="username"
              //  value={form.username}
             //   onChange={handleChange}
                placeholder="아이디"
                required /><span>아이디</span></label>
                 <label htmlFor="username">
              <input
                id="nickname"
                type="text"
                name="nickname"
             //   value={form.nickname}
             //   onChange={handleChange}
                placeholder="닉네임"
                required /><span>닉네임</span></label>
            <label htmlFor="password">
              <input
                id="password"
                type="password"
                name="password"
             //   value={form.password}
             //   onChange={handleChange}
                placeholder="비밀번호"
                required /><span>비밀번호</span></label>  
          </form>
              <div className="btns">
                  <button className='btn-org' type="submit" form="editForm">회원정보 수정</button>
                  <button className='btn-gray' onClick={() => router.back()}>이전</button>
              </div>
        </div>
      </div>
       <BottomNavigation />
    </div>
  );
}

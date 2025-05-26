'use client';

import axiosInstance from "../../../api/axiosInstance";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyPage() {
  const router = useRouter();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
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

  // 👉 로그아웃 핸들러 함수
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
    <div>
      <h1>마이페이지</h1>
      <p>마이페이지입니다!</p>
      {/* 로그아웃 버튼 추가 */}
      <button onClick={handleLogout}>로그아웃</button>
    </div>
  );
}

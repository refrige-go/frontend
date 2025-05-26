'use client';

import axios from 'axios';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "../../../api/axiosInstance";

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

export default function MyPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. access 토큰이 localStorage에 있는지 먼저 체크
    const accessToken = localStorage.getItem('accessToken');

    console.log("accessToken in Main2Page:", accessToken);
    
    if (!accessToken) {
      alert("로그인 후 이용 가능합니다.");
      router.replace("/login");
      return;
    }

    // 2. 토큰이 있으면, 토큰이 유효한지 확인을 위해 백엔드 API 호출
    axiosInstance.get("/secure/ping") 
      .then(() => {
        // 성공(유효한 토큰) -> 아무 일도 안 하고 그냥 페이지 정상 유지
      })
      .catch(() => {
        // 실패(만료/변조/비정상 토큰)
        alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
        localStorage.removeItem('accessToken');
        router.replace("/login");
      });
  }, [router]);

  return (
    <div>
      <h1>마이페이지</h1>
      <p>마이페이지입니다!</p>
    </div>
  );
}

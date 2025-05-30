'use client';

import axios from 'axios';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "../../../api/axiosInstance";

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

export default function Main2Page() {
  const router = useRouter();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    console.log("accessToken in Main2Page:", accessToken);
    
    if (!accessToken) {
      alert("로그인 후 이용 가능합니다.");
      router.replace("/login");
      return;
    }

    axiosInstance.get("/secure/ping") 
      .then(() => {
      })
      .catch(() => {
        alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
        localStorage.removeItem('accessToken');
        router.replace("/login");
      });
  }, [router]);

  return (
    <div>
      <h1>메인2 페이지</h1>
      <p>로그인된 사용자만 볼 수 있습니다!</p>
    </div>
  );
}

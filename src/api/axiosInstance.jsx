// src/utils/axiosInstance.js
import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

// 1. axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: `${baseUrl}`, // 백엔드 주소
  withCredentials: true, // refresh 토큰 쿠키 자동 첨부
});

// 2. 모든 요청에 access 토큰 자동 첨부 (요청 인터셉터)
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. 응답 인터셉터 - access 토큰 만료시 자동 재발급 및 재요청
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401(Unauthorized)이고, 아직 재시도 안 한 요청이면
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

       console.log('🚩 reissue 요청!', new Date().toISOString());

      try {
        // refresh 토큰은 쿠키로 전송됨 (withCredentials: true)
        const reissueRes = await axios.post(
           `${baseUrl}/reissue`,
          {},
          { withCredentials: true }
        );

        console.log("reissue response headers:", reissueRes.headers);

        if (reissueRes.status === 200) {
          // 새 access 토큰은 헤더로 옴
          const newAccessToken = reissueRes.headers['access'];

           console.log("newAccessToken:", newAccessToken); // 여기서 undefined면 문제
          localStorage.setItem('accessToken', newAccessToken);

          // 원래 요청 헤더를 새 access 토큰으로 업데이트
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          // 원래 요청을 다시 시도
          return axiosInstance(originalRequest);
        }
      } catch (reissueError) {
        // 재발급 실패 → access 토큰 제거 후 로그인 페이지로 이동
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(reissueError);
      }
    }

    // 401 이외의 오류 or 재시도 실패면 그냥 오류 반환
    return Promise.reject(error);
  }
);


export default axiosInstance;

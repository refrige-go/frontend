import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // 백엔드 주소 맞게 설정
  withCredentials: true,            // 필요 시 쿠키 포함
});

export default api;
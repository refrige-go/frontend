'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

export default function LocationSender() {
  const [status, setStatus] = useState('위치를 가져오는 중...');
  const [result, setResult] = useState(null);

  const sendLocation = (lat, lon) => {
    axiosInstance.post('/api/weather/location', {
      latitude: lat,
      longitude: lon
    })
      .then(res => {
        const data = res.data;
        console.log("날씨", data.weather);
        console.log("제철 재료", data.seasonalIngredients);
        console.log("추천 레시피", data.recommendedRecipes);
        setResult(data);  // 전체 저장
        setStatus('추천 완료');
      })
      .catch(() => setStatus('서버 전송 실패'));


    useEffect(() => {
      if (!navigator.geolocation) {
        setStatus('위치 정보를 지원하지 않는 브라우저입니다.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          console.log('위치 좌표:', latitude, longitude);
          sendLocation(latitude, longitude);
        },
        () => setStatus('위치 정보를 가져올 수 없습니다.')
      );
    }, []); // ⬅️ 컴포넌트가 처음 렌더링될 때 한 번 실행

    return (
      <div>
        <p>{status}</p>
        {result && <p>{result}</p>}
      </div>
    );
  }
}

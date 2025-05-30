'use client';

import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

export default function LocationSender() {
  const [status, setStatus] = useState('위치를 가져오는 중...');
  const [result, setResult] = useState(null);

  const sendLocation = (lat, lon) => {
    axiosInstance.post('/api/weather/location', {
      latitude: lat,
      longitude: lon
    }, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        // axios는 res.json() 필요없고, res.data로 바로 접근 가능
        setResult(res.data.message);
        setStatus('위치 전송 성공');
      })
      .catch(() => setStatus('서버 전송 실패'));
  };


  const handleClick = () => {
    if (!navigator.geolocation) {
      setStatus('위치 정보를 지원하지 않는 브라우저입니다.');
      return;
    }
    setStatus('위치 정보를 가져오는 중...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log('위치 좌표:', latitude, longitude);
        sendLocation(latitude, longitude);
      },
      () => setStatus('위치 정보를 가져올 수 없습니다.')
    );
  };

  return (
    <div>
      <button onClick={handleClick}>내 위치 전송</button>
      <p>{status}</p>
      {result && <p>{result}</p>}
    </div>
  );
}

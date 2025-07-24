'use client';

import SubPageHeader from '../../components/layout/SubPageHeader';
import BottomNavigation from '../../components/layout/BottomNavigation';
import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';

export default function OCRPage() {
  const webcamRef = useRef(null);
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [useCamera, setUseCamera] = useState(true); // 카메라 사용 여부
  const [token, setToken] = useState(null);  // 토큰 상태 추가
  const [isLoading, setIsLoading] = useState(false); //로딩중 상태 관리

   // 토큰 로드
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    setToken(storedToken);
  }, []);

  // 사진 촬영
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPreview(imageSrc);
    setUseCamera(false); // 촬영 후 카메라 끄고 미리보기로 전환
  };

  // 갤러리 버튼 클릭 시 input 클릭
  const openGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // 같은 파일 연속 선택 가능하게
      fileInputRef.current.click();
    }
  };

  // 파일 선택 시 미리보기로 전환
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreview(ev.target.result);
        setUseCamera(false); // 미리보기 모드로 전환
      };
      reader.readAsDataURL(file);
    }
  };

  // OCR 서버로 전송
  const goToResultWithGoodBill = async () => {
    if (!token) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    let file;

    if (preview) {
      const res = await fetch(preview);
      file = await res.blob();
    } else {
      alert('사진을 먼저 촬영하거나 업로드하세요!');
      return;
    }

    // 로딩 시작
    setIsLoading(true);

    const formData = new FormData();
    formData.append('image', file); 

    try {

      console.log('서버로 요청 전송 시작...');
      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${baseUrl}/api/ocr/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('서버 응답 상태:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('서버 응답 데이터:', result);

        const storageData = {
          ingredients: result.ingredients.map(item => ({
            ...item,
            ingredient_id: item.ingredient_id || null
          })),
          purchaseDate: result.purchaseDate
        };
        
        console.log('sessionStorage에 저장할 데이터:', storageData);
        sessionStorage.setItem('ocr_ingredients', JSON.stringify(storageData));
        router.push('/ocr/result');
      } else {
        const errorText = await response.text();
        console.error('서버 응답 상태:', response.status);
        console.error('서버 응답:', errorText);
        alert('OCR 서버 오류가 발생했습니다.');
      }
    } catch (error) {
      alert('OCR 처리 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      //로딩 종류
      setIsLoading(false);
    }
  };

  return (
    <div className="mainContainer">
      <SubPageHeader title="재료 사진 인식" />
      
      <div className="appContainerSub" style={{ paddingBottom: '0px', overflow: 'hidden' }}>
        {/* 안내 메시지 */}
        <div style={{
          background: '#f97316',
          color: '#fff',
          borderRadius: 12,
          padding: '16px 18px',
          margin: '18px auto 24px auto',
          width: '100%',
          maxWidth: 400,
          fontSize: '1.1em',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '6px',
            margin: 0,
          }}>
            AI가 재료를 자동으로 찾아드려요!
          </h2>
          <p style={{
            fontSize: '14px',
            opacity: 0.9,
            lineHeight: 1.4,
            margin: 0,
          }}>
            영수증 사진을 찍어보세요
          </p>
        </div>

        {/* 카메라/미리보기 영역 */}
        <div className="scrollContent" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '0 20px',
          flex: 1,
          height: 'calc(100vh - 200px)',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '320px',
            aspectRatio: '1/1.4',
            background: '#f3f6fa',
            border: '2px dashed #b3c6e0',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
            marginTop: '0px',
            marginBottom: '16px',
          }}>
            {useCamera ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                onUserMediaError={err => { console.error("카메라 에러:", err); }}
                onUserMedia={() => { console.log("카메라 접근 성공"); }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 14,
                }}
                videoConstraints={{
                  facingMode: "environment"
                }}
              />
            ) : (
              preview && (
                <img
                  src={preview}
                  alt="미리보기"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 14,
                  }}
                />
              )
            )}
          </div>

          {/* 버튼 영역 */}
          <div style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            width: 'calc(100% - 40px)',
            maxWidth: '400px',
            padding: '0',
            zIndex: 10,
            flexWrap: 'nowrap', // 줄바꿈 방지
          }}>
            {useCamera ? (
              <>
                {/* 촬영 버튼 */}
                <button
                  onClick={capture}
                  style={{
                    background: '#f97316',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '70px',
                    height: '70px',
                    fontSize: '24px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(249, 115, 22, 0.3)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                  }}
                  onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  📷
                </button>
                
                {/* 갤러리 버튼 */}
                <button
                  onClick={openGallery}
                  style={{
                    background: '#fff',
                    color: '#f97316',
                    border: '2px solid #f97316',
                    borderRadius: '12px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    whiteSpace: 'nowrap',
                    flex: '0 0 auto',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#fef7f0';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#fff';
                  }}
                >
                  갤러리
                </button>
                
                {/* 숨겨진 파일 input */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </>
            ) : (
              <>
                {/* 다시 촬영 버튼 */}
                <button
                  onClick={() => setUseCamera(true)}
                  style={{
                    background: '#fff',
                    color: '#666',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    whiteSpace: 'nowrap',
                    flex: '0 0 auto',
                  }}
                >
                  다시 촬영
                </button>

                {/* OCR인식 버튼 */}
                <button
                  onClick={goToResultWithGoodBill}
                  disabled={isLoading} // 로딩 중 비활성화
                  style={{
                    background: isLoading ? '#ffa06c' : '#f97316',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 20px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 16px rgba(249, 115, 22, 0.3)',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    flex: '1 1 auto',
                    minWidth: '140px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#ea580c';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#f97316';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                    {isLoading ? (
                    <>
                      <div className="button-spinner"></div>
                      분석중...
                    </>
                  ) : (
                    '🔍 OCR 인식하기'
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <BottomNavigation />

           {/* 로딩 오버레이 추가 */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div className="spinner"></div>
          <div style={{
            color: 'white',
            marginTop: '20px',
            fontSize: '18px',
            fontWeight: '600',
          }}>
            영수증 분석중...
          </div>
        </div>
      )}

      {/* 스피너 스타일 추가 */}
      <style jsx>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #ffffff;
          border-top: 4px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

       .button-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #ffffff;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }        
      `}</style>
    </div>
  );
}

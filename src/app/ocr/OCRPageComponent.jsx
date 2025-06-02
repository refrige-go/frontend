'use client';

import Header from '../../components/layout/Header';
import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';

export default function OCRPage() {
  const webcamRef = useRef(null);
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [useCamera, setUseCamera] = useState(true); // 카메라 사용 여부

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

  // OCR 서버로 전송 (촬영/업로드된 이미지를 백엔드로 보내는 함수)
  const goToResultWithGoodBill = async () => {
    let file;

    if (preview) {
      // [1] 미리보기(preview)에 저장된 이미지는 dataURL(base64) 문자열임
      // 이걸 실제 이미지 파일(Blob)로 변환해야 서버에 전송 가능
      // fetch(preview)는 dataURL을 받아 Blob 객체로 변환해줌
      const res = await fetch(preview);
      file = await res.blob();
    } else {
      // [2] 만약 미리보기 이미지가 없으면(촬영/업로드 안 했으면) 경고 후 함수 종료
      alert('사진을 먼저 촬영하거나 업로드하세요!');
      return;
    }
      // [3] FormData 객체 생성 (multipart/form-data 방식으로 서버에 파일 전송)
      // 'image'라는 key로 Blob 파일을 form에 추가
      // 'billbill.jpg'는 서버에서 파일명 필요할 때 사용(실제 파일명은 중요하지 않음)
    const formData = new FormData();
    formData.append('image', file); 

    try {
      // [4] fetch로 Spring Boot 백엔드 서버에 POST 요청
      // - 주소: http://localhost:8080/api/ocr/process
      // - method: POST
      // - body: formData (이미지 파일이 포함된 multipart/form-data)
      // Content-Type은 자동으로 multipart/form-data로 설정됨
      const response = await fetch('http://localhost:8080/api/ocr/process', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        // [5] 서버에서 받은 응답을 JSON으로 파싱
        // (서버가 OCR 결과를 JSON 형태로 반환한다고 가정)
        let result = await response.json();

        // [6] OCR 결과(ingredients, purchaseDate 등)를 sessionStorage에 저장
        // - sessionStorage는 브라우저의 임시 저장소(새로고침/탭 닫으면 사라짐)
        // - JSON.stringify로 JS 객체를 문자열로 변환해서 저장
        // - 나중에 결과 페이지에서 JSON.parse로 다시 객체로 꺼내서 사용
        sessionStorage.setItem('ocr_ingredients', JSON.stringify({
          ingredients: result.ingredients,
          purchaseDate: result.purchaseDate
        }));
         // [7] 결과 페이지로 이동 (예: /ocr/result)
        router.push('/ocr/result');
      } else {
        // [8] 서버에서 오류 응답이 오면 경고창 표시
        alert('OCR 서버 오류가 발생했습니다.');
      }
    } catch (error) {
      alert('OCR 처리 중 오류가 발생했습니다.');
      console.error(error);
      // [9] 네트워크 오류 등 예외 발생 시 경고창 표시 및 콘솔 출력
    }
  };
    return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Header />
      </div>
      <style jsx>{`
        body, .container {
          background: #f7faff;
        }
        .container {
          width: 420px;         /* 헤더와 동일하게 */
          max-width: 98vw;      /* 모바일 대응 */
          margin: 0 auto;       /* 중앙 정렬 */
          min-height: 100vh;    /* 필요시 전체 높이 */
        }
        .header-wrap {
          width: 92vw;
          max-width: 400px;
          margin: 0 auto;
          margin-top: 50px; 
        }
        .header {
          background: #f97316;
          color: #fff;
          padding: 20px 24px 14px 24px;
          border-radius: 0 0 18px 18px;
          box-shadow: 0 2px 8px #0001;
          text-align: left;
          width: 100%;
          box-sizing: border-box;
        }
        .header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header-title {
          font-size: 1.5em;
          font-weight: bold;
        }
        .header-info {
          background: #fff3;
          border-radius: 50%;
          width: 22px; height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1em;
          font-weight: bold;
        }
        .header-desc {
          font-size: 1em;
          margin-top: 6px;
          opacity: 0.95;
        }
        .camera-area {
          margin: 22px auto 0 auto;
          width: 92vw;
          max-width: 400px;
          aspect-ratio: 1/1.1;
          background: #f3f6fa;
          border: 2px dashed #b3c6e0;
          border-radius: 18px;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .footer-btn {
          margin: 0 8px;
          padding: 12px 24px;
          font-size: 1.08em;
          border: none;
          border-radius: 12px;
          background: #f3f6fa;
          color: #f79726;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
          min-width: 120px; 
        }
        .footer-btn:active {
          background: #ffe0a3;
        }
        .main-btn {
          background: #fff;
          color: #f79726;
          font-size: 2.1em;
          border-radius: 50%;
          width: 64px;
          height: 64px;
          min-width: 64px;
          min-height: 64px;
          max-width: 64px;
          max-height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 12px;
          box-shadow: 0 2px 8px #0002;
          border: 4px solid #f79726;
          padding: 0;
          flex: none;
        }
        .main-btn:active {
          background: #d17a00;
        }
        @media (max-width: 500px) {
          .header-wrap, .header, .camera-area, .footer { max-width: 98vw; }
        }
      `}</style>

      {/* 상단 헤더 */}
      <div className="header-wrap">
        <div className="header">
          <div className="header-row">
            <span className="header-title">재료 사진 인식</span>
            <span className="header-info">i</span>
          </div>
          <div className="header-desc">
            AI가 재료를 자동으로 찾아드려요!<br />
            영수증이나 재료 사진을 찍어보세요
          </div>
        </div>
      </div>

      {/* 카메라/미리보기 영역 */}
      <div className="camera-area" style={{ position: "relative" }}>
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
              borderRadius: 18,
              position: "absolute",
              top: 0, left: 0,
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
                borderRadius: 18,
                position: "absolute",
                top: 0, left: 0,
              }}
            />
          )
        )}
      </div>

      {/* 버튼 영역 */}
      {useCamera ? (
        <div style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "15px",
          marginTop: "24px",
          position: "fixed",
          left: 0,
          bottom: "20px",
          zIndex: 100
        }}>
          {/* 뒤로가기(메인으로) 버튼 */}
          <button
            className="footer-btn"
            onClick={() => router.push('/refrigerator')}
            style={{ background: "#f3f6fa", color: "#f79726" }}
          >
            뒤로가기
          </button>
          {/* 촬영 버튼 */}
          <button className="footer-btn main-btn" onClick={capture}>  
            <span style={{ fontSize: "0.8em", fontWeight: "bold", lineHeight: 1 }}>촬영</span>
          </button>
          {/* 갤러리 버튼 */}
          <button className="footer-btn" onClick={openGallery}>
            <span style={{ fontSize: "1em", fontWeight: "bold" }}>갤러리</span>
          </button>
          {/* 숨겨진 파일 input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginTop: "24px",
          position: "fixed",
          left: 0,
          bottom: "20px",
          zIndex: 100
        }}>
          {/* 뒤로가기 버튼 (카메라로 복귀) */}
          <button
            className="footer-btn"
            onClick={() => setUseCamera(true)}
            style={{ background: "#f3f6fa", color: "#f79726" }}
          >
            뒤로가기
          </button>

          {/* OCR인식 버튼 */}
          <button className="footer-btn main-btn" onClick={goToResultWithGoodBill}>
            <span style={{ fontSize: "0.6em", fontWeight: "bold", lineHeight: 1 }}>
              OCR<br />인식
            </span>
          </button>

          {/* 다시 촬영 버튼 */}
          <button className="footer-btn" onClick={() => setUseCamera(true)}>
            다시 촬영
          </button>
          
        </div>
      )}
    </div>
  );
}
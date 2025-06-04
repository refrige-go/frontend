'use client';

import axiosInstance from "../../../api/axiosInstance";
import Header from '../../../components/layout/Header'
import BottomNavigation from '../../../components/layout/BottomNavigation'
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import "../../../styles/pages/mypageset.css"

export default function MyPageSet() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState(""); // 이미지 URL 저장
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef();

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      // 회원정보 수정
      await axiosInstance.put("/user/mypage-update", {
        nickname: nickname,
        password: password,
      });
      alert("회원정보가 수정되었습니다.");
      router.replace("/mypage");
    } catch (err) {
      alert("회원정보 수정에 실패했습니다.");
    }
  };


  useEffect(() => {

    axiosInstance.get("/user/mypage")
      .then(res => {
        setNickname(res.data.nickname);
        setUsername(res.data.username);
        setProfileImageUrl(res.data.profileImageUrl || "");
      })
      .catch(err => {
        console.log("유저 정보 요청 실패", err);
      });

    // 토큰이 정상발급 되고있는지 console에서 확인하는 프론트코드 
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {

      const payloadBase64 = accessToken.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

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

 

  // 파일 미리보기
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // 파일 업로드
  const handleUpload = async () => {
    const file = fileInputRef.current.files[0];
    if (!file) {
      alert("이미지를 선택하세요.");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const res = await axiosInstance.post("/user/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("프로필 사진이 업로드되었습니다!");
      window.location.reload();
    } catch (err) {
      alert("업로드 실패");
    }
  };



  return (
    <div className="mainContainer">
      <Header />
      <div className="appContainer mypageset">
        <div className="profile">
          <div className="profile-img">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
             {preview ? (
              <div className="img-preview">
                <img src={preview} alt="미리보기" width={120} height={120} style={{ borderRadius: "50%" }} />
              </div>
            ) : profileImageUrl ? (
              <div className="img-preview">
                <img src={profileImageUrl} alt="프로필" width={120} height={120} style={{ borderRadius: "50%" }} />
              </div>
            ) : null}
            <button onClick={handleUpload}>이미지수정</button>
          </div>
          <span>{nickname || "닉네임을 불러오는 중..."}</span>
        </div>
        <div className="edit-box">
          <h1>회원정보 수정</h1>
          <form id="editForm" onSubmit={handleEditSubmit}>
            <label htmlFor="username">
              <span>아이디</span>
              <span>{username || "아이디를 불러오는 중..."}</span>
            </label>
            <label htmlFor="nickname">
              <input
                id="nickname"
                type="text"
                name="nickname"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="닉네임"
                required /><span>닉네임</span></label>
            <label htmlFor="password">
              <input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
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

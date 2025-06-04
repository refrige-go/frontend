'use client';

import axiosInstance from "../../../api/axiosInstance";
import Header from '../../../components/layout/Header'
import BottomNavigation from '../../../components/layout/BottomNavigation'
import { useEffect , useState } from "react";
import { useRouter } from "next/navigation";
import "../../../styles/pages/mypage.css"

export default function MyPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState(""); 
  const [profileImgUrl, setProfileImgUrl] = useState("");

  // nickname 불러오기
  useEffect(() => {
     axiosInstance.get("/user/mypage")
      .then(res => {
        setNickname(res.data.nickname); 
        setProfileImgUrl(res.data.profileImageUrl);
      })
      .catch(err => {
        console.log("유저 정보 요청 실패", err);
      });

    
    // 토큰이 정상발급 되고있는지 console에서 확인 
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

  // 로그아웃
  const handleLogout = async () => {
    try {
      await axiosInstance.post("/logout");
      localStorage.removeItem('accessToken');
      router.replace("/");
    } catch (error) {
      alert("로그아웃에 실패했습니다.");
    }
  };

  //회원탈퇴
  const handleWithdraw = async () => {
  if (!window.confirm("정말로 회원 탈퇴하시겠습니까?")) return;
  try {
    await axiosInstance.delete("/user/withdraw"); // 백엔드에서 deleted: true 처리
    localStorage.removeItem('accessToken'); // 토큰 삭제
    alert("회원 탈퇴가 완료되었습니다.");
    router.replace("/login"); // 로그인 페이지로 이동
  } catch (error) {
    alert("회원 탈퇴에 실패했습니다.");
  }
};


  return (
    <div className="mainContainer">
      <Header />
      <div className="appContainer mypage">
        <div className="profile">
          <div className="img">
             {profileImgUrl ? (
              <img
                src={profileImgUrl}
                alt="프로필 이미지"
                width={120}
                height={120}
                style={{ borderRadius: "50%", objectFit: "cover" }}
              />
            ) : null }
          </div>
          <span>{nickname || "닉네임을 불러오는 중..."}</span>
        </div>
        <div className="myCook">
          <h3>마이페이지</h3>
          <div className="mypage-box">
            <button className="gray-btn" onClick={handleLogout}>
              <i><img src="../images/logout.svg" alt="logout" /></i>
              <span>로그아웃</span></button>
            <img src="../images/bar.svg" alt="bar" />
            <button className="gray-btn" onClick={handleWithdraw}>
               <i><img src="../images/userdelete.svg" alt="userdelete" /></i>
              <span>회원탈퇴</span></button>
            <img src="../images/bar.svg" alt="bar" />
            <div>
              <a href="../mypageset">
                 <i><img src="../images/setting.svg" alt="setting" /></i>
              <span>내 정보 설정</span>
              </a>
            </div>
          </div>
        </div>
       
      </div>
       <BottomNavigation />
    </div>
  );
}

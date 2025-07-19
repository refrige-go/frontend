'use client';

import React, { useEffect, useState } from 'react';
import NotificationItem from '../../components/NotificationItem';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import styles from '../../styles/pages/notification.module.css';
import { useRouter } from 'next/navigation';
import axiosInstance from '../../api/axiosInstance';

const NotificationsPage = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert("로그인 후 이용 가능합니다.");
      router.replace("/login");
      return;
    }

    // 토큰 유효성 검증
    axiosInstance.get("/secure/ping")
      .catch(() => {
        alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
        localStorage.removeItem('accessToken');
        router.replace("/login");
      });

    fetchNotifications();
  }, [router]);

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get('/notifications');
      const sorted = [...response.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNotifications(sorted);
    } catch (error) {
      console.error('알림을 불러오는데 실패했습니다:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    console.log('알림 클릭:', notification);
    console.log('recipeId:', notification.recipeId);

    if (!notification.isRead) {
      try {
        await axiosInstance.post(`/notifications/${notification.id}/read`);
        fetchNotifications(); // 읽음 처리 후 목록 갱신
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error);
      }
    }

    // 레시피 ID가 있으면 해당 레시피의 상세 페이지로 이동
    if(notification.recipeId){
      console.log('레시피 상세 페이지로 이동:', notification.recipeId);
      router.push(`/recipe-detail/${notification.recipeId}`);
    }else{
      //recipeId가 없으면 알림 내용에서 레시피 이름 추출해서 검색
      const extractRecipeName = (content) =>{
        const match = content.match(/^(.+?)\s+어때요\?/);
        return match ? match[1].trim() : null;
      };

      const recipeName = extractRecipeName(notification.content);
      console.log('추출된 레시피 이름:', recipeName);
      
      if(recipeName){
        //router.push(`/search-results?q=${encodeURIComponent(recipeName)}`);
      }
    }
  };

  return (
    <div className="mainContainer">
      <Header />
      <div className="appContainer">
        <main style={{
            fontFamily: 'sans-serif',
            }}>
          <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                ))}
                {notifications.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    알림이 없습니다
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default NotificationsPage; 
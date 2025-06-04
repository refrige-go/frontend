'use client';

import React from 'react';
import NotificationList from '../../components/notifications/NotificationList';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import styles from '../../styles/pages/notification.module.css';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const NotificationsPage = () => {
  const router = useRouter();

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
  }, [router]);

  return (
    <div className="mainContainer">
      <Header />
      <div className="appContainer">
        <div className={styles.pageContainer}>
          <div className={styles.contentWrapper}>
            <NotificationList />
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default NotificationsPage; 
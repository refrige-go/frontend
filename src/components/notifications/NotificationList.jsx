'use client';

import React, { useEffect, useState } from 'react';
import NotificationItem from '../notifications/NotificationItem';
import styles from '../../styles/pages/notification.module.css';
import axiosInstance from '../../api/axiosInstance';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get('/notifications');

      const sorted = [...response.data].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setNotifications(sorted);
      console.log(sorted);
    } catch (error) {
      console.error('알림을 불러오는데 실패했습니다:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await axiosInstance.post(`/notifications/${notification.id}/read`);
        fetchNotifications(); // 읽음 처리 후 목록 갱신
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error);
      }
    }
  };

  return (
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
  );
};

export default NotificationList;

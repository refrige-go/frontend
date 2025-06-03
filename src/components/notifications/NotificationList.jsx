'use client';

import React, { useEffect, useState } from 'react';
import NotificationItem from './NotificationItem';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('알림을 불러오는데 실패했습니다:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await fetch(`/api/notifications/${notification.id}/read`, {
          method: 'PUT',
        });
        // 알림 목록 갱신
        fetchNotifications();
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
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#6b7280'
        }}>
          알림이 없습니다
        </div>
      )}
    </div>
  );
};

export default NotificationList; 
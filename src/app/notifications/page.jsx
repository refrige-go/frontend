'use client';

import React from 'react';
import NotificationList from '@/components/notifications/NotificationList';

const NotificationsPage = () => {
  return (
    <div style={{
      paddingTop: '60px',
      height: 'calc(100vh - 120px)',
      overflow: 'auto',
      background: '#f9fafb'
    }}>
      <div style={{ padding: '20px' }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          알림
        </h1>
        <NotificationList />
      </div>
    </div>
  );
};

export default NotificationsPage; 
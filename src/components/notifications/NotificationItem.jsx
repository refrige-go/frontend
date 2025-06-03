'use client';

import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const NotificationItem = ({ notification, onClick }) => {
  return (
    <div
      onClick={() => onClick(notification)}
      style={{
        padding: '16px',
        background: notification.isRead ? '#fff' : '#f0f9ff',
        borderRadius: '8px',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s',
        ':hover': {
          transform: 'scale(1.01)'
        }
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px'
      }}>
        <span style={{ 
          fontWeight: notification.isRead ? 'normal' : 'bold',
          fontSize: '1rem'
        }}>
          {notification.title}
        </span>
        <span style={{ 
          color: '#6b7280',
          fontSize: '0.875rem'
        }}>
          {format(new Date(notification.createdAt), 'M월 d일 HH:mm', { locale: ko })}
        </span>
      </div>
      <p style={{ 
        color: '#4b5563',
        fontSize: '0.875rem'
      }}>
        {notification.content}
      </p>
    </div>
  );
};

export default NotificationItem; 
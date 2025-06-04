'use client';

import React from 'react';
import NotificationList from '../../components/notifications/NotificationList';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import styles from '../../styles/pages/notification.module.css';

const NotificationsPage = () => {
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
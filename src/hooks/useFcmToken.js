"use client";

import { useEffect } from "react";
import { messaging } from "../lib/firebase";
import { getToken, onMessage } from "firebase/messaging";
import axiosInstance from "../api/axiosInstance";

// TODO: 아래 VAPID_KEY를 본인 프로젝트에 맞게 입력하세요.
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export default function useFcmToken() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        getToken(messaging, { vapidKey: VAPID_KEY })
          .then((currentToken) => {
            if (currentToken) {
              // 토큰을 백엔드로 전송 (인증 토큰 자동 포함)
              axiosInstance.post("/api/fcm-token", { fcmToken: currentToken })
                .then(() => {
                  console.log("FCM 토큰이 성공적으로 백엔드에 전송되었습니다.");
                })
                .catch((error) => {
                  console.error("FCM 토큰 전송 실패:", error);
                });
            }
          })
          .catch((err) => {
            console.error("FCM 토큰 받기 실패:", err);
          });
      }
    });

    // 포그라운드 메시지 수신
    onMessage(messaging, (payload) => {
      if (payload.notification) {
        const { title, body } = payload.notification;
        new Notification(title, { body });
      }
    });
  }, []);
} 
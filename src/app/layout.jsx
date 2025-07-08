"use client";

import '../styles/globals.css'; // 전역 CSS 가져오기
import { Suspense } from 'react';
import useFcmToken from "../hooks/useFcmToken";

export default function RootLayout({ children }) {
  useFcmToken();
  
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>냉장GO</title>
      </head>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
        <div id="root-portal"></div>
      </body>
    </html>

  );
}
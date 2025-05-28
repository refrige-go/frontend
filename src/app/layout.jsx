import '../styles/globals.css'; // 전역 CSS 가져오기
import { Suspense } from 'react';

export default function RootLayout({ children }) {
  
  return (
    <Suspense fallback={<p>로딩 중...</p>}>
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>냉장GO</title>
        </head>
        <body>
          {children}
          <div id="root-portal"></div>
        </body>
      </html>
    </Suspense>
  );
}

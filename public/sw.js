const CACHE_NAME = 'naengjanggo-v1.0.1';
const STATIC_CACHE = 'naengjanggo-static-v1.0.1';
const DYNAMIC_CACHE = 'naengjanggo-dynamic-v1.0.1';

// 핵심 파일들 (오프라인에서도 필수)
const CORE_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// 동적 캐싱할 리소스 패턴
const CACHE_PATTERNS = [
  /\/_next\/static\/.*/,
  /\/api\/recipes\/.*\?cache=true/,
  /\.(png|jpg|jpeg|svg|gif|webp|ico)$/,
  /\.(woff|woff2|ttf|eot)$/
];

// 캐시하지 않을 패턴 (실시간 데이터)
const NO_CACHE_PATTERNS = [
  /\/api\/auth\/.*/,
  /\/api\/user\/.*/,
  /\/api\/upload\/.*/,
  /\/api\/realtime\/.*/
];

// 서비스워커 설치
self.addEventListener('install', (event) => {
  console.log('[SW] 서비스워커 설치 중...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] 핵심 파일 캐싱 중...');
        return cache.addAll(CORE_CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] 설치 완료');
        // 즉시 활성화
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] 설치 중 오류:', error);
      })
  );
});

// 서비스워커 활성화
self.addEventListener('activate', (event) => {
  console.log('[SW] 서비스워커 활성화 중...');
  event.waitUntil(
    // 이전 캐시 정리
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] 이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[SW] 활성화 완료');
      // 모든 클라이언트 제어
      return self.clients.claim();
    })
  );
});

// 네트워크 요청 처리
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 캐시하지 않을 요청 패턴 체크
  if (NO_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(fetch(request));
    return;
  }

  // GET 요청만 캐시 처리
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          // 캐시에 있으면 즉시 반환
          if (cachedResponse) {
            console.log('[SW] 캐시에서 제공:', request.url);
            
            // 백그라운드에서 업데이트 (stale-while-revalidate)
            fetch(request)
              .then((freshResponse) => {
                if (freshResponse && freshResponse.status === 200) {
                  const responseClone = freshResponse.clone();
                  caches.open(DYNAMIC_CACHE)
                    .then((cache) => cache.put(request, responseClone));
                }
              })
              .catch(() => {});
            
            return cachedResponse;
          }
          
          // 캐시에 없으면 네트워크에서 가져오기
          return fetch(request)
            .then((response) => {
              // 응답이 유효하고 캐싱 가능한 패턴인지 확인
              if (response && response.status === 200) {
                const shouldCache = CACHE_PATTERNS.some(pattern => 
                  pattern.test(url.pathname) || pattern.test(url.href)
                );
                
                if (shouldCache) {
                  const responseClone = response.clone();
                  caches.open(DYNAMIC_CACHE)
                    .then((cache) => {
                      console.log('[SW] 동적 캐싱:', request.url);
                      cache.put(request, responseClone);
                    });
                }
              }
              
              return response;
            })
            .catch((error) => {
              console.log('[SW] 네트워크 오류, 오프라인 폴백:', error);
              
              // HTML 요청인 경우 홈페이지로 폴백
              if (request.headers.get('Accept').includes('text/html')) {
                return caches.match('/');
              }
              
              // 다른 리소스는 에러 반환
              throw error;
            });
        })
    );
  }
});

// 백그라운드 동기화 (미래 기능)
self.addEventListener('sync', (event) => {
  console.log('[SW] 백그라운드 동기화:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 오프라인 중 저장된 데이터 동기화
      syncOfflineData()
    );
  }
});

// 푸시 알림 (미래 기능)
self.addEventListener('push', (event) => {
  console.log('[SW] 푸시 메시지 수신:', event.data ? event.data.text() : '데이터 없음');
  
  const options = {
    body: '새로운 레시피 추천이 도착했습니다!',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: 'recipe-notification',
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: '확인하기',
        icon: '/icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('냉장GO', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 알림 클릭:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// 오프라인 데이터 동기화 함수
async function syncOfflineData() {
  try {
    // IndexedDB에서 오프라인 중 저장된 데이터 가져오기
    // 서버로 동기화 요청
    console.log('[SW] 오프라인 데이터 동기화 완료');
  } catch (error) {
    console.error('[SW] 동기화 오류:', error);
  }
}

// 캐시 크기 관리
async function cleanupCache() {
  const cache = await caches.open(DYNAMIC_CACHE);
  const keys = await cache.keys();
  
  // 100개 넘으면 오래된 것부터 삭제
  if (keys.length > 100) {
    const toDelete = keys.slice(0, keys.length - 80);
    await Promise.all(
      toDelete.map(key => cache.delete(key))
    );
    console.log('[SW] 캐시 정리 완료:', toDelete.length, '개 삭제');
  }
}

// 주기적 캐시 정리
setInterval(cleanupCache, 60000); // 1분마다

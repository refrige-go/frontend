/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // appDir: true, // ✅ App Router 활성화 설정 추가
    esmExternals: false,
  },
  images: {
    domains: ['www.foodsafetykorea.go.kr'], // 외부 이미지 도메인 등록
  },
};

// export default nextConfig;
module.exports = nextConfig;
import type { NextConfig } from "next";

// next.config.ts
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        // 👇 UPDATE THIS PORT to 5001
        destination: 'http://localhost:5001/:path*', 
      },
    ];
  },
};
// const nextConfig: NextConfig = {
//   // ... your other config ...
  
//   async rewrites() {
//     return [
//       {
//         source: '/api/backend/:path*', // The fake path frontend uses
//         destination: 'http://<YOUR_AWS_IP_HERE>/:path*', // The REAL path (Put your AWS IP here)
//       },
//     ];
//   },
// };

export default nextConfig;
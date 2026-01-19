import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... your other config ...
  
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*', // The fake path frontend uses
        destination: 'http://<YOUR_AWS_IP_HERE>/:path*', // The REAL path (Put your AWS IP here)
      },
    ];
  },
};

export default nextConfig;
import type { NextConfig } from 'next';
const nextConfig: NextConfig = {reactStrictMode:true,images:{minimumCacheTTL:3600,localPatterns:[{pathname:'/api/media/**',search:''},{pathname:'/assets/**',search:''}]}};
export default nextConfig;

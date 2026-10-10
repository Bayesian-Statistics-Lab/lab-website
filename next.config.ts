import type { NextConfig } from 'next';
const nextConfig: NextConfig = {reactStrictMode:true,images:{minimumCacheTTL:60,localPatterns:[{pathname:'/api/media/**',search:''},{pathname:'/assets/**',search:''}]}};
export default nextConfig;

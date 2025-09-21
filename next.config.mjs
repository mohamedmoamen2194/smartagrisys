/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    MCB_API_URL: process.env.MCB_API_URL || 'http://localhost:8001',
  },
}

export default nextConfig
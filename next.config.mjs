/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    AI_BACKEND_URL: process.env.AI_BACKEND_URL || 'http://localhost:8000',
  },
}

export default nextConfig
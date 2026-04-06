/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // IMPORTANTE para PWA
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

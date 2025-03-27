/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    // Only using remotePatterns - domains is deprecated
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      }
    ],
    // Explicitly set domains to undefined to avoid any legacy config
    domains: undefined
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  compiler: {
    styledComponents: true,
  }
};

module.exports = nextConfig; 
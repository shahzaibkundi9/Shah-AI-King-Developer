/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ FORCE env injection for client
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
  },

  images: {
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;

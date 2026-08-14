/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },

  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"]
  }
};

export default nextConfig;

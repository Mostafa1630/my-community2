/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // Tree-shakes these to only the specific icons/modules each file actually imports
  // instead of pulling the whole package into every route's bundle — framer-motion
  // and lucide-react are both imported across a large number of client components now.
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"]
  }
};

export default nextConfig;

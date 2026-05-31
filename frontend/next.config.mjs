/** @type {import('next').NextConfig} */
const backend =
  process.env.API_PROXY_TARGET?.replace(/\/$/, "") ||
  process.env.BACKEND_INTERNAL_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

const nextConfig = {
  async rewrites() {
    if (!backend) return [];
    return [
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
      { source: "/uploads/:path*", destination: `${backend}/uploads/:path*` },
    ];
  },
};

export default nextConfig;

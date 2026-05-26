import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {

  output: "standalone", 
  cacheComponents: true,

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/:type(account|activity|article|blog|carousel|download|member|misc|news|other-page|photo|profile|video)/:folder(images|files|content)/:path*",
          destination: "/api/uploads/:type/:folder/:path*",
        },
      ],
    };
  },
  
  async redirects() {
    return [
      {
        source: "/member/executive",
        destination: "/member?type=executive",
        permanent: true,
      },
      {
        source: "/member/advisor-body",
        destination: "/member?type=advisor-body",
        permanent: true,
      },
      {
        source: "/member/general",
        destination: "/member?type=general",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jamaat-e-islami.org",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

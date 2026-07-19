import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://accounts.google.com https://apis.google.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com https://accounts.google.com",
  "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false, // Segurança: Oculta código fonte em produção
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN' // Allows iframe from same origin (needed for neon-tubes.html)
        },
        {
          key: 'Cross-Origin-Opener-Policy',
          value: 'same-origin-allow-popups'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff' // Proteção contra MIME Sniffing
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Content-Security-Policy',
          value: contentSecurityPolicy
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), geolocation=(), microphone=(), payment=(), usb=()'
        }
      ]
    }
  ]
};

export default nextConfig;

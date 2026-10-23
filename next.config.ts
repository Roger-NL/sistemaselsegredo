import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval' " : ""}https://accounts.google.com https://apis.google.com`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com https://accounts.google.com",
  "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const publicDemoCsp = [
  "default-src 'self'", "base-uri 'self'", "object-src 'none'", "form-action 'self'", "frame-ancestors 'self'",
  `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'", "font-src 'self' data:", "img-src 'self' data: blob:",
  "media-src 'self' https://*.public.blob.vercel-storage.com", `connect-src 'self' ${process.env.NODE_ENV === "development" ? "ws:" : ""}`,
  "frame-src 'none'", "worker-src 'self' blob:",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false, // Segurança: Oculta código fonte em produção
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
          value: 'SAMEORIGIN'
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
    },
    ...["/", "/demo"].map(source => ({ source, headers: [{ key: "Content-Security-Policy", value: publicDemoCsp }] })),
  ]
};

export default nextConfig;

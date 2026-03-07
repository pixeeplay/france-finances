import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {},
  env: {
    NEXT_PUBLIC_AUTH_GOOGLE: process.env.GOOGLE_CLIENT_ID ? "1" : "",
    NEXT_PUBLIC_AUTH_GITHUB: process.env.GITHUB_ID ? "1" : "",
  },
  async redirects() {
    return [
      { source: "/results", destination: "/resultats", permanent: true },
      { source: "/profile", destination: "/profil", permanent: true },
      { source: "/ranking", destination: "/classement", permanent: true },
      { source: "/share", destination: "/partage", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            // SEC-22: 'unsafe-inline' in script-src is required by Next.js for inline scripts
            // (hydration, next/script). This is a known risk (XSS via inline injection).
            // TODO: Migrate to nonce-based CSP in a future sprint once Next.js middleware
            // supports per-request nonce injection (track: https://github.com/vercel/next.js/discussions/54907).
            // SEC-23: connect-src tightened from broad `https:` to specific allowed origins.
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://france-finances.com https://*.france-finances.com https://accounts.google.com https://github.com https://api.github.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; ") + ";",
          },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Allow data: URLs for base64 screenshots
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  // Expose public env vars to the browser at runtime.
  // NEXT_PUBLIC_API_URL — the FastAPI base URL (http://localhost:8000)
  // NEXT_PUBLIC_WS_URL  — the WebSocket base URL (ws://localhost:8000)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000",
  },
};

module.exports = nextConfig;

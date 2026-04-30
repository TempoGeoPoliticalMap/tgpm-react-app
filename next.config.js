/** @type {import('next').NextConfig} */
const securityHeaders = [
  {key: "X-Frame-Options", value: "DENY"},
  {key: "X-Content-Type-Options", value: "nosniff"},
  {key: "Referrer-Policy", value: "strict-origin-when-cross-origin"},
  {key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()"},
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.tgpm.world https://raw.githubusercontent.com",
      "font-src 'self' data:",
      "frame-ancestors 'none'"
    ].join("; ")
  }
];

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders
      }
    ];
  }
};

module.exports = nextConfig;

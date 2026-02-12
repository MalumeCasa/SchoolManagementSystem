/** @type {import('next').NextConfig} */
const nextConfig = {
  // Trust the proxy headers
  experimental: {
    serverActions: {
      // Allow this specific hostname
      allowedOrigins: [
        'localhost:3000',
        'curly-couscous-pj559vvw5gxvf7j95-3000.app.github.dev',
        // Add any other development hosts here
      ],
    },
  },
}

module.exports = nextConfig
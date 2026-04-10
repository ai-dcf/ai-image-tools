/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow all dev origins for preview
  allowedDevOrigins: [
    'run-agent-69d8ec1f2936cc54b56aa384-mnsvp97z-preview.agent-sandbox-my-b1-gw.trae.ai',
    'localhost',
  ],
};

module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    LINE_NOTIFY_TOKEN: process.env.LINE_NOTIFY_TOKEN,
  },
}

export default nextConfig;

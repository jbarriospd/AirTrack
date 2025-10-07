/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/': ['./data/**/*'],
    },
  },
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/': ['./data/**/*'],
  },
}

module.exports = nextConfig

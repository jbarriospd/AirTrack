import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/app/actions/**': ['./db/**/*.json'],
    '/app/page': ['./db/**/*.json'],
  },
}

export default nextConfig

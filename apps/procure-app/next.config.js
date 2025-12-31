/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@constructflow/shared-db', '@constructflow/shared-ui'],
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
  experimental: {
    serverActions: true,
  },
  // Fix for monorepo deployment
  output: 'standalone',
}

module.exports = nextConfig

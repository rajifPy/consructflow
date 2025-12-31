const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@constructflow/shared-db', '@constructflow/shared-ui'],
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
  experimental: {
    serverActions: true,
  },
  output: 'standalone',
}

module.exports = nextConfig

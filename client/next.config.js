/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: [
    {
      source: '/auth',
      destination: '/',
      permanent: true,
    }
  ]
}

module.exports = nextConfig

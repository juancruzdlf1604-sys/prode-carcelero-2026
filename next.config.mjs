/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  // Suprimir error de build sin Supabase configurado
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true }, // TEMPORARY while iterating
  eslint: { ignoreDuringBuilds: true }     // if you don't need ESLint to gate deploys
};

export default nextConfig;

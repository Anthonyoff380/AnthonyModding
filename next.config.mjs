/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Discord - Pour héberger les images du panel admin
      {
        protocol: 'https',
        hostname: 'media.discordapp.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
      // Ton domaine - Pour les images uploadées via le panel
      {
        protocol: 'https',
        hostname: 'www.champagnesimulation.fr',
      },
      {
        protocol: 'https',
        hostname: 'champagnesimulation.fr',
      },
      // Cloudinary - Au cas où tu utilises ce service
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // Imgur - Autre option populaire
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
    ],
  },
};

export default nextConfig;
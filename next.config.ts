import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Porta padrão do AVA conforme nginx.conf: 3001 */
  /* Para rodar em 3001, use: npm run dev -- -p 3001 */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;

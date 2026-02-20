// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   experimental: {
//     serverComponentsExternalPackages: ["yahoo-finance2", "cheerio"],
//   },
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Next.js 14.2.x still uses the experimental key (serverExternalPackages
  // was only promoted to stable in Next.js 15). Using experimental here
  // avoids the "Unrecognized key" warning on 14.2.5.
  experimental: {
    serverComponentsExternalPackages: ["yahoo-finance2", "cheerio", "node-cache"],
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Stub out Deno-only test imports so webpack never tries to resolve them
      config.resolve.alias = {
        ...config.resolve.alias,
        "@std/testing/mock": false,
        "@std/testing": false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
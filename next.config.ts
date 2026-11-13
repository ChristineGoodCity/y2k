import type { NextConfig } from "next";

const config: NextConfig = {
  async rewrites() {
    const endpoint = process.env.WORDPRESS_GRAPHQL_URL;
    if (!endpoint || process.env.CONTENT_SOURCE === "snapshot") return [];
    return [
      {
        source: "/wp-content/uploads/:path*",
        destination: `${new URL(endpoint).origin}/wp-content/uploads/:path*`,
      },
    ];
  },
};

export default config;

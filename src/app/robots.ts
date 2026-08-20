import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/dashboard",
          "/settings",
          "/chat",
          "/requests",
          "/notifications",
          "/_next/",
        ],
      },
    ],
    sitemap: "https://keralammatch.com/sitemap.xml",
    host: "https://keralammatch.com",
  };
}

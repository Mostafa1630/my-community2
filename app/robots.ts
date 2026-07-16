import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/*/my-communities",
          "/*/favorites",
          "/*/learn/",
          "/*/communities/*/feed",
          "/*/profile",
          "/*/creator/"
        ]
      }
    ],
    sitemap: "https://mujtamaaty.example/sitemap.xml"
  };
}

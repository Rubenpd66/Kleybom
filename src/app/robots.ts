import type { MetadataRoute } from "next";
import { RUTAS_NO_INDEXABLES, url } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: RUTAS_NO_INDEXABLES },
    sitemap: url("/sitemap.xml"),
  };
}

import type { MetadataRoute } from "next";
import { infoPages } from "@/content/pages";
import { products } from "@/content/products";
import { siteOrigin } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap():MetadataRoute.Sitemap { const paths=["", "ecosystem", "download", "support", "license", ...products.map(p=>p.id), ...infoPages.map(p=>p.slug)]; return paths.map((path,i)=>({url:`${siteOrigin}/${path}${path ? "/" : ""}`,changeFrequency:i<5?"weekly":"monthly",priority:i===0?1:i<5?.9:.7})); }

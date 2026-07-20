import type { MetadataRoute } from "next";
import { infoPages } from "@/content/pages";
import { products } from "@/content/products";
export const dynamic = "force-static";
export default function sitemap():MetadataRoute.Sitemap { const paths=["", "ecosystem", "download", ...products.map(p=>p.id), ...infoPages.map(p=>p.slug)]; return paths.map((path,i)=>({url:`https://glyphq.org/${path}`,changeFrequency:i<3?"weekly":"monthly",priority:i===0?1:i<3?.9:.7})); }

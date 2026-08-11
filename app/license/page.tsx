import type { Metadata } from "next";
import { LicensePage } from "@/components/pages/LicensePage";
import { siteOrigin, socialImageUrl } from "@/lib/site";

const title = "Licenses, stated precisely";
const description = "Repository, license, and maintenance status across Glyph software.";
const canonical = `${siteOrigin}/license/`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: {
    title,
    description,
    url: canonical,
    images: [{ url: socialImageUrl, width: 1200, height: 630, alt: "Glyph independent software built for Qubic" }],
  },
  twitter: { card: "summary_large_image", title, description, images: [socialImageUrl] },
};

export default function LicenseRoute() {
  return <LicensePage />;
}

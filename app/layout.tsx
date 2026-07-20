import type { Metadata } from "next";
import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist-mono/400.css";
import "./globals.css";
import "./warm.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MotionLoader } from "@/components/MotionLoader";

export const metadata: Metadata = {
  metadataBase: new URL("https://glyphq.org"),
  title: { default: "Glyph — Independent software built for Qubic", template: "%s — Glyph" },
  description: "Glyph builds dependable wallets, libraries, and infrastructure for the Qubic network.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Glyph", title: "Glyph — Independent software built for Qubic", description: "Build on Qubic without rebuilding the basics.", images: ["/social/default.svg"] },
  twitter: { card: "summary_large_image", title: "Glyph", description: "Independent software built for Qubic.", images: ["/social/default.svg"] },
};

const organization = { "@context": "https://schema.org", "@type": "Organization", name: "Glyph", url: "https://glyphq.org", sameAs: ["https://github.com/glyphq"], description: "An independent community project building software for the Qubic network." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><Header /><MotionLoader />{children}<Footer /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} /></body></html>;
}

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
import { siteOrigin, socialImageUrl } from "@/lib/site";

const socialImage = {
  url: socialImageUrl,
  width: 1200,
  height: 630,
  alt: "Glyph independent software built for Qubic",
};

const themeBootstrap = "try{const theme=localStorage.getItem('glyph-theme');if(theme==='light'||theme==='dark')document.documentElement.dataset.theme=theme}catch{}";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: { default: "Glyph | Independent software built for Qubic", template: "%s | Glyph" },
  description: "Glyph builds dependable wallets, libraries, and infrastructure for the Qubic network.",
  alternates: { canonical: `${siteOrigin}/` },
  openGraph: { type: "website", siteName: "Glyph", url: `${siteOrigin}/`, title: "Glyph | Independent software built for Qubic", description: "Build on Qubic without rebuilding the basics.", images: [socialImage] },
  twitter: { card: "summary_large_image", title: "Glyph", description: "Independent software built for Qubic.", images: [socialImageUrl] },
  icons: {
    icon: [
      { url: "/favicon/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/favicon/icon-192.png", sizes: "192x192", type: "image/png" },
  },
};

const organization = { "@context": "https://schema.org", "@type": "Organization", name: "Glyph", url: siteOrigin, logo: `${siteOrigin}/favicon/icon.png`, sameAs: ["https://github.com/glyphq"], description: "An independent community project building software for the Qubic network." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body suppressHydrationWarning><script dangerouslySetInnerHTML={{ __html: themeBootstrap }} /><a className="skip-link" href="#main">Skip to content</a><Header /><MotionLoader />{children}<Footer /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} /></body></html>;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DownloadPage } from "@/components/pages/DownloadPage";
import { EcosystemPage } from "@/components/pages/EcosystemPage";
import { InfoPage } from "@/components/pages/InfoPage";
import { NotFoundView } from "@/components/pages/NotFoundView";
import { ProductPageView } from "@/components/products/ProductPageView";
import { infoPages, pageBySlug } from "@/content/pages";
import { productById, products } from "@/content/products";

const specialRoutes = ["ecosystem", "download", "404"];

export function generateStaticParams() {
  return [
    ...products.map((product) => ({ slug: product.id })),
    ...infoPages.map((page) => ({ slug: page.slug })),
    ...specialRoutes.map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = productById[slug];
  const page = pageBySlug[slug];
  const title = product?.name ?? (slug === "ecosystem" ? "Glyph ecosystem" : slug === "download" ? "Download Glyph Wallet" : slug === "404" ? "Page not found" : page?.title);
  const description = product?.summary ?? page?.description ?? (slug === "ecosystem" ? "How Glyph products fit together across user, application, developer, and infrastructure layers." : slug === "404" ? "The requested Glyph page could not be found." : "Verified Glyph Wallet downloads for Windows, macOS, and Linux.");

  if (!title) return {};

  return {
    title,
    description,
    alternates: { canonical: `/${slug}` },
    robots: slug === "404" ? { index: false, follow: false } : undefined,
    openGraph: { title, description, url: `/${slug}`, images: ["/social/default.svg"] },
    twitter: { card: "summary_large_image", title, description, images: ["/social/default.svg"] },
  };
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = productById[slug];
  const page = pageBySlug[slug];

  if (product) return <ProductPageView product={product} />;
  if (slug === "ecosystem") return <EcosystemPage />;
  if (slug === "download") return <DownloadPage />;
  if (slug === "404") return <NotFoundView />;
  if (page) return <InfoPage slug={slug} page={page} />;

  notFound();
}

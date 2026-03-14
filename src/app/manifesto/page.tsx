import ManifestoReader from "@/components/ManifestoReader";
import { article1 } from "@/data/manifesto/part-1";
import { article2 } from "@/data/manifesto/part-2";
import { article3 } from "@/data/manifesto/part-3";
import { article4 } from "@/data/manifesto/part-4";
import { article5 } from "@/data/manifesto/part-5";
import { Metadata, ResolvingMetadata } from "next";

const articles = [article1, article2, article3, article4, article5];

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ article?: string }> }
): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const targetSlug = resolvedParams.article || "part-1-roman-politicians";
  const activeArticle = articles.find((a) => a.slug === targetSlug) || article1;
  const canonicalUrl = `https://model.delights.pro/manifesto?article=${activeArticle.slug}`;

  return {
    title: `${activeArticle.title.professional} | Model Delights Manifesto`,
    description: activeArticle.subtitle.professional,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: activeArticle.title.professional,
      description: activeArticle.subtitle.professional,
      siteName: "Model Delights",
      images: activeArticle.heroImage ? [
        {
          url: activeArticle.heroImage.url,
          width: 1200,
          height: 630,
          alt: activeArticle.heroImage.alt,
        }
      ] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: activeArticle.title.professional,
      description: activeArticle.subtitle.professional,
      images: activeArticle.heroImage ? [activeArticle.heroImage.url] : [],
      creator: "@ModelDelights",
    }
  };
}

export default async function ManifestoPage({
  searchParams,
}: {
  searchParams: Promise<{ article?: string }>;
}) {
  const resolvedParams = await searchParams;
  const targetSlug = resolvedParams.article || "part-1-roman-politicians";
  const activeArticle = articles.find((a) => a.slug === targetSlug) || article1;

  // AIEO (AI Engine Optimization) & SEO structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: activeArticle.title.professional,
    description: activeArticle.subtitle.professional,
    image: activeArticle.heroImage ? [activeArticle.heroImage.url] : [],
    datePublished: new Date(activeArticle.date).toISOString(),
    author: [{
        "@type": "Person",
        name: "Linus Innovator",
        url: "https://model.delights.pro"
    }],
    publisher: {
      "@type": "Organization",
      name: "Model Delights",
      logo: {
        "@type": "ImageObject",
        url: "https://model.delights.pro/logo.png"
      }
    }
  };

  return (
    <div className="bg-[#09090b] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ManifestoReader key={activeArticle.slug} article={activeArticle} allArticles={articles} />
    </div>
  );
}

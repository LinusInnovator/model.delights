import InsightsReader from "@/components/InsightsReader";
import { articleSnellTimeout } from "@/data/insights/snell-timeout-prevention";
import { articleOpenClawIntegration } from "@/data/insights/openclaw-snell-integration";
import { Metadata, ResolvingMetadata } from "next";

const articles = [articleSnellTimeout, articleOpenClawIntegration];

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ article?: string }> }
): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const targetSlug = resolvedParams.article || "snell-timeout-prevention";
  const activeArticle = articles.find((a) => a.slug === targetSlug) || articleSnellTimeout;
  const canonicalUrl = `https://model.delights.pro/insights?article=${activeArticle.slug}`;

  return {
    title: `${activeArticle.title.technical} | Model Delights Insights`,
    description: activeArticle.subtitle.technical,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: activeArticle.title.technical,
      description: activeArticle.subtitle.technical,
      siteName: "Model Delights",
      images: activeArticle.heroImage ? [
        {
          url: activeArticle.heroImage.url,
          width: 1200,
          height: 630,
          alt: activeArticle.heroImage.alt,
        }
      ] : [
        {
          url: "/og-manifesto.png",
          width: 1200,
          height: 630,
          alt: "Model Delights Insights"
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: activeArticle.title.technical,
      description: activeArticle.subtitle.technical,
      images: activeArticle.heroImage ? [activeArticle.heroImage.url] : ["/og-manifesto.png"],
      creator: "@ModelDelights",
    }
  };
}

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ article?: string }>;
}) {
  const resolvedParams = await searchParams;
  const targetSlug = resolvedParams.article || "snell-timeout-prevention";
  const activeArticle = articles.find((a) => a.slug === targetSlug) || articleSnellTimeout;

  // AIEO (AI Engine Optimization) & SEO structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: activeArticle.title.technical,
    description: activeArticle.subtitle.technical,
    image: activeArticle.heroImage ? [activeArticle.heroImage.url] : [],
    datePublished: new Date(activeArticle.datePublished).toISOString(),
    dateModified: new Date(activeArticle.lastVerifiedDate).toISOString(),
    author: [{
        "@type": "Person",
        name: activeArticle.author.name,
        url: "https://model.delights.pro"
    }],
    publisher: {
      "@type": "Organization",
      name: "Model Delights",
      logo: {
        "@type": "ImageObject",
        url: "https://model.delights.pro/logo.png"
      }
    },
    // Adding the primary answer into the FAQ structure to guarantee highly visible extraction
    mainEntity: {
      "@type": "Question",
      name: activeArticle.primaryAnswer.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: activeArticle.primaryAnswer.summary
      }
    }
  };

  return (
    <div className="bg-[#09090b] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InsightsReader key={activeArticle.slug} article={activeArticle} allArticles={articles} />
    </div>
  );
}

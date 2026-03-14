import ManifestoReader from "@/components/ManifestoReader";
import { article1 } from "@/data/manifesto/part-1";
import { article2 } from "@/data/manifesto/part-2";
import { article3 } from "@/data/manifesto/part-3";
import { article4 } from "@/data/manifesto/part-4";
import { article5 } from "@/data/manifesto/part-5";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manifesto | model.delights.pro",
  description: "The zero-maintenance engineering playbook.",
};

const articles = [article1, article2, article3, article4, article5];

export default function ManifestoPage({
  searchParams,
}: {
  searchParams: { article?: string };
}) {
  const targetSlug = searchParams.article || "part-1-roman-politicians";
  let activeArticle = articles.find((a) => a.slug === targetSlug) || article1;

  // We pass all articles so the reader can render "Next/Previous" links
  return (
    <div className="bg-[#09090b] min-h-screen">
      <ManifestoReader article={activeArticle} allArticles={articles} />
    </div>
  );
}

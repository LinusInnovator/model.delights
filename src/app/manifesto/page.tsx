import ManifestoReader from "@/components/ManifestoReader";
import { article1 } from "@/data/manifesto/part-1";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manifesto | model.delights.pro",
  description: "The zero-maintenance engineering 11-day playbook.",
};

export default function ManifestoPage() {
  return (
    <div className="bg-[#09090b] min-h-screen">
      <ManifestoReader article={article1} />
    </div>
  );
}

import { fetchModels } from "@/lib/api";
import Directory from "@/components/Directory";

// Next.js config to ensure this layout is ISR cached globally
export const revalidate = 300; // 5 minutes

export default async function Home() {
  const initialData = await fetchModels();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Directory initialData={initialData} />
    </main>
  );
}

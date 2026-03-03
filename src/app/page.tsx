import { fetchModels } from "@/lib/api";
import Directory from "@/components/Directory";

// Next.js config to ensure this layout is ISR cached globally
export const revalidate = 300; // 5 minutes

export default async function Home() {
  const initialData = await fetchModels();

  return (
    <main>
      <Directory initialData={initialData} />
    </main>
  );
}

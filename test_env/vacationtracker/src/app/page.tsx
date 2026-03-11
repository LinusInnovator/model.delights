export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white">
      <h1 className="text-4xl font-bold mb-4">VacationTracker</h1>
      <p className="text-zinc-400">Your AI-generated scaffolding is ready.</p>
      <div className="mt-8 p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-sm font-mono">
        Open <span className="text-cyan-400">@.agent/instructions.md</span> in Cursor or Windsurf to begin.
      </div>
    </main>
  );
}
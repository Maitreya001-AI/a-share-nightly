import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

export default async function DailyPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const repoRoot = process.cwd();
  const p = path.join(repoRoot, "content", "daily", `${date}.md`);
  const md = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : `Not found: ${date}`;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <header className="space-y-2">
        <Link className="underline text-sm" href="/daily">← 返回归档</Link>
        <h1 className="text-2xl font-semibold">复盘：{date}</h1>
      </header>
      <article className="prose prose-neutral max-w-none whitespace-pre-wrap">
        {md}
      </article>
    </main>
  );
}

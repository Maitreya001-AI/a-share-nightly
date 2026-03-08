import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

export default function HandbookPage() {
  const repoRoot = process.cwd();
  const p = path.join(repoRoot, "content", "handbook.md");
  const md = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "(missing)";

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <header className="space-y-2">
        <Link className="underline text-sm" href="/">← 返回</Link>
        <h1 className="text-2xl font-semibold">底层逻辑手册</h1>
      </header>
      <article className="prose prose-neutral max-w-none whitespace-pre-wrap">
        {md}
      </article>
    </main>
  );
}

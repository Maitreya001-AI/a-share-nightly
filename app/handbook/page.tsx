import fs from "node:fs";
import path from "node:path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function HandbookPage() {
  const p = path.join(process.cwd(), "content", "handbook.md");
  const md = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "# 手册\n\n暂无内容。";

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex gap-2 text-sm">
        <a href="/" className="rounded-lg border px-3 py-2 hover:bg-zinc-50">← 首页</a>
        <a href="/insights" className="rounded-lg border px-3 py-2 hover:bg-zinc-50">Insights</a>
      </div>
      <h1 className="text-3xl font-bold">底层逻辑手册</h1>
      <article className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm prose prose-zinc max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
      </article>
    </main>
  );
}

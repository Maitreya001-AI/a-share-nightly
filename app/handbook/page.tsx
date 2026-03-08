import fs from "node:fs";
import path from "node:path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function HandbookPage() {
  const p = path.join(process.cwd(), "content", "handbook.md");
  const md = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "# 手册\n\n暂无内容。";

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 text-zinc-900">
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        <a href="/" className="btn">← 首页</a>
        <a href="/insights" className="btn">Insights</a>
        <a href="/search" className="btn">搜索</a>
      </div>

      <section className="card p-6">
        <h1 className="text-3xl font-bold">底层逻辑手册</h1>
        <article className="prose prose-zinc mt-6 max-w-none prose-headings:font-semibold prose-a:text-blue-700 prose-pre:overflow-x-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
        </article>
      </section>
    </main>
  );
}

import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type PageProps = {
  params: Promise<{ date: string }>;
};

export default async function DailyPage({ params }: PageProps) {
  const { date } = await params;
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
  if (!safeDate) return notFound();

  const filePath = path.join(process.cwd(), "content", "daily", `${safeDate}.md`);
  if (!fs.existsSync(filePath)) return notFound();

  const md = fs.readFileSync(filePath, "utf8");

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <a href="/" className="text-sm text-blue-600 hover:underline">
        ← 返回首页
      </a>
      <h1 className="mt-3 text-3xl font-bold">日报 {safeDate}</h1>

      <article className="prose prose-zinc prose-headings:scroll-mt-20 mt-6 max-w-none prose-a:text-blue-700 prose-pre:overflow-x-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
      </article>
    </main>
  );
}

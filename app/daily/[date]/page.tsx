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
    <main className="mx-auto max-w-4xl px-6 py-10 text-zinc-900">
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        <a href="/" className="rounded-lg border px-3 py-2 hover:bg-zinc-50">← 首页</a>
        <a href="/insights" className="rounded-lg border px-3 py-2 hover:bg-zinc-50">Insights</a>
        <a href="/handbook" className="rounded-lg border px-3 py-2 hover:bg-zinc-50">手册</a>
      </div>

      <h1 className="text-3xl font-bold">日报 {safeDate}</h1>

      <article className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: (props) => <h1 className="mt-6 text-3xl font-bold" {...props} />,
            h2: (props) => <h2 className="mt-8 border-l-4 border-zinc-900 pl-3 text-2xl font-semibold" {...props} />,
            h3: (props) => <h3 className="mt-6 text-xl font-semibold" {...props} />,
            p: (props) => <p className="mt-4 leading-8 text-zinc-800" {...props} />,
            ul: (props) => <ul className="mt-3 list-disc space-y-2 pl-6" {...props} />,
            ol: (props) => <ol className="mt-3 list-decimal space-y-2 pl-6" {...props} />,
            li: (props) => <li className="leading-7" {...props} />,
            blockquote: (props) => (
              <blockquote className="mt-4 border-l-4 border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-700" {...props} />
            ),
            a: (props) => <a className="text-blue-700 underline hover:text-blue-800" target="_blank" rel="noreferrer" {...props} />,
            code: (props) => <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm" {...props} />,
            pre: (props) => <pre className="mt-4 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-zinc-100" {...props} />,
            hr: () => <hr className="my-8 border-zinc-200" />,
          }}
        >
          {md}
        </ReactMarkdown>
      </article>
    </main>
  );
}

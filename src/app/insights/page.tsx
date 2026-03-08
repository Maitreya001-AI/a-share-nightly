import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

type Insight = {
  id?: string;
  title: string;
  url: string;
  source?: string;
  authors?: string[];
  publishedAt?: string;
  summary?: string;
  quotes?: { text: string; where?: string }[];
  tags?: string[];
  status?: string;
};

function readJson<T>(p: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export default function InsightsPage() {
  const repoRoot = process.cwd();
  const p = path.join(repoRoot, "content", "insights", "index.json");
  const insights = readJson<Insight[]>(p, []);

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <header className="space-y-2">
        <Link className="underline text-sm" href="/">← 返回</Link>
        <h1 className="text-2xl font-semibold">真知灼见库</h1>
        <p className="text-sm text-gray-600">
          每条是“文章/观点卡片”。你可以在 JSON 里改 status/tags，nightly 会帮你做索引。
        </p>
      </header>

      {insights.length === 0 ? (
        <p className="text-sm text-gray-500">暂无（等待 nightly 生成）。</p>
      ) : (
        <ul className="space-y-3">
          {insights.map((it, idx) => (
            <li key={it.url + idx} className="rounded border p-3 space-y-1">
              <a className="underline" href={it.url} target="_blank" rel="noreferrer">
                {it.title}
              </a>
              <div className="text-xs text-gray-600">
                {[it.source, it.publishedAt, it.status].filter(Boolean).join(" · ")}
              </div>
              {it.summary ? <p className="text-sm whitespace-pre-wrap">{it.summary}</p> : null}
              {it.tags?.length ? (
                <div className="text-xs text-gray-700">tags: {it.tags.join(", ")}</div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

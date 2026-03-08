import fs from "node:fs";
import path from "node:path";

type Insight = {
  id: string;
  title: string;
  url: string;
  source?: string;
  summary?: string;
  tags?: string[];
  status?: string;
};

function readJson<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

function looksBroken(text?: string) {
  if (!text) return false;
  return /Ã|Â|�|ã|æ|ç|ï¼|%PDF-|JFIF/.test(text);
}

export default function InsightsPage() {
  const insights = readJson<Insight[]>(path.join(process.cwd(), "content", "insights", "index.json"), []);
  const clean = insights.filter((i) => !looksBroken(i.title) && !looksBroken(i.summary));

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex gap-2 text-sm">
        <a href="/" className="rounded-lg border px-3 py-2 hover:bg-zinc-50">← 首页</a>
        <a href="/handbook" className="rounded-lg border px-3 py-2 hover:bg-zinc-50">手册</a>
      </div>
      <h1 className="text-3xl font-bold">Insights 库</h1>
      <p className="mt-2 text-zinc-600">共 {clean.length} 条（已过滤乱码/异常内容）</p>

      <ul className="mt-6 space-y-4">
        {clean.map((item) => (
          <li key={item.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <a href={item.url} target="_blank" rel="noreferrer" className="text-lg font-semibold text-blue-700 hover:underline">
              {item.title}
            </a>
            <div className="mt-1 text-xs text-zinc-500">{item.source ?? "unknown"} · {item.status ?? "new"}</div>
            {item.summary && <p className="mt-2 text-sm leading-7 text-zinc-700">{item.summary}</p>}
          </li>
        ))}
      </ul>
    </main>
  );
}

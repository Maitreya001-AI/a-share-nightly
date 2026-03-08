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

type Props = {
  searchParams: Promise<{ q?: string; tag?: string }>;
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

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", tag = "" } = await searchParams;
  const insights = readJson<Insight[]>(path.join(process.cwd(), "content", "insights", "index.json"), []);
  const tags = readJson<string[]>(path.join(process.cwd(), "content", "insights", "tags.json"), []);

  const clean = insights.filter((i) => !looksBroken(i.title) && !looksBroken(i.summary));
  const kw = q.trim().toLowerCase();
  const filtered = clean.filter((i) => {
    const hitKw = !kw || `${i.title} ${i.summary ?? ""} ${i.source ?? ""}`.toLowerCase().includes(kw);
    const hitTag = !tag || (i.tags ?? []).includes(tag);
    return hitKw && hitTag;
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 text-zinc-900">
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        <a href="/" className="btn">← 首页</a>
        <a href="/insights" className="btn">Insights</a>
        <a href="/handbook" className="btn">手册</a>
      </div>

      <section className="card p-6">
        <h1 className="text-3xl font-bold">搜索</h1>
        <form className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_auto]" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="关键词（标题/摘要/来源）"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
          <select name="tag" defaultValue={tag} className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm">
            <option value="">全部标签</option>
            {tags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">搜索</button>
        </form>

        <p className="mt-3 text-sm text-zinc-600">结果：{filtered.length} 条</p>

        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {filtered.map((item) => (
            <li key={item.id} className="rounded-xl border border-zinc-200 bg-white p-4">
              <a href={item.url} target="_blank" rel="noreferrer" className="font-semibold text-blue-700 hover:underline">
                {item.title}
              </a>
              <p className="mt-1 text-xs text-zinc-500">{item.source ?? "unknown"}</p>
              {item.summary && <p className="mt-2 text-sm leading-7 text-zinc-700 line-clamp-4">{item.summary}</p>}
              {(item.tags?.length ?? 0) > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.tags!.map((t) => <span key={t} className="rounded-full border px-2 py-0.5 text-xs">{t}</span>)}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

import fs from "node:fs";
import path from "node:path";

function readJson<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

type DailyIndexItem = { date: string; path: string; title?: string };
type Insight = {
  id: string;
  title: string;
  url: string;
  source?: string;
  summary?: string;
  tags?: string[];
  status?: string;
};

export default function Home() {
  const repoRoot = process.cwd();
  const dailyIndexPath = path.join(repoRoot, "content", "daily", "index.json");
  const insightsPath = path.join(repoRoot, "content", "insights", "index.json");
  const tagsPath = path.join(repoRoot, "content", "insights", "tags.json");

  const dailyIndex = readJson<DailyIndexItem[]>(dailyIndexPath, []);
  const insights = readJson<Insight[]>(insightsPath, []);
  const tags = readJson<string[]>(tagsPath, []);

  const latestDaily = [...dailyIndex].sort((a, b) => b.date.localeCompare(a.date))[0];
  const latestInsights = insights.slice(0, 10);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 text-zinc-900">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">A-Share Nightly</h1>
        <p className="mt-2 text-zinc-600">自动生成的 A 股观察站：日报 + 素材洞察。</p>
      </header>

      <section className="mb-8 rounded-2xl border border-zinc-200 p-5">
        <h2 className="text-xl font-semibold">最新日报</h2>
        {latestDaily ? (
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="font-medium">{latestDaily.date}</p>
              <p className="text-sm text-zinc-600">路径：{latestDaily.path}</p>
            </div>
            <a
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
              href={latestDaily.path}
            >
              查看日报
            </a>
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">暂无日报数据，请先运行 nightly:full。</p>
        )}
      </section>

      <section className="mb-8 rounded-2xl border border-zinc-200 p-5">
        <h2 className="text-xl font-semibold">日报归档</h2>
        {dailyIndex.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm">
            {[...dailyIndex]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((d) => (
                <li key={d.date}>
                  <a className="text-blue-600 hover:underline" href={d.path}>
                    {d.date}
                  </a>
                </li>
              ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">暂无归档。</p>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Insights（最近 10 条）</h2>
          <p className="text-sm text-zinc-500">总计 {insights.length} 条</p>
        </div>

        {tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-zinc-300 px-2 py-1 text-xs text-zinc-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <ul className="space-y-4">
          {latestInsights.map((item) => (
            <li key={item.id} className="rounded-xl border border-zinc-200 p-4">
              <a href={item.url} target="_blank" rel="noreferrer" className="font-medium text-blue-700 hover:underline">
                {item.title}
              </a>
              <div className="mt-1 text-xs text-zinc-500">
                来源：{item.source ?? "unknown"} · 状态：{item.status ?? "new"}
              </div>
              {item.summary && (
                <p className="mt-2 line-clamp-3 text-sm text-zinc-700">{item.summary}</p>
              )}
            </li>
          ))}
        </ul>

        {latestInsights.length === 0 && (
          <p className="text-sm text-zinc-500">暂无 insights 数据。</p>
        )}
      </section>
    </main>
  );
}

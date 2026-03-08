import Link from "next/link";
import fs from "node:fs";
import path from "node:path";

function readJson<T>(p: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as T;
  } catch {
    return fallback;
  }
}

type DailyIndexItem = { date: string; path: string; title?: string };

export default function Home() {
  const repoRoot = process.cwd();
  const dailyIndexPath = path.join(repoRoot, "content", "daily", "index.json");
  const daily = readJson<DailyIndexItem[]>(dailyIndexPath, []).slice().reverse();
  const latest = daily[0];

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">A股短线雷达（Nightly）</h1>
        <p className="text-sm text-gray-600">
          每晚 23:00 本地抓取 & 整理 → commit/push → Vercel 自动部署。
          <br />
          不做荐股：只输出观察池 / 情景推演 / 风险条件。
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">最新复盘</h2>
        {latest ? (
          <Link className="underline" href={latest.path}>
            {latest.date}
          </Link>
        ) : (
          <p className="text-sm text-gray-500">暂无内容（等待 nightly 生成）。</p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">内容</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <Link className="underline" href="/handbook">
              底层逻辑手册
            </Link>
          </li>
          <li>
            <Link className="underline" href="/insights">
              真知灼见库（文章/观点）
            </Link>
          </li>
          <li>
            <Link className="underline" href="/daily">
              每日复盘归档
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}

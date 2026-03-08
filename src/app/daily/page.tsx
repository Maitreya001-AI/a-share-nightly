import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

type DailyIndexItem = { date: string; path: string; title?: string };

function readJson<T>(p: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export default function DailyIndexPage() {
  const repoRoot = process.cwd();
  const p = path.join(repoRoot, "content", "daily", "index.json");
  const items = readJson<DailyIndexItem[]>(p, []).slice().reverse();

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <header className="space-y-2">
        <Link className="underline text-sm" href="/">← 返回</Link>
        <h1 className="text-2xl font-semibold">每日复盘归档</h1>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">暂无（等待 nightly 生成）。</p>
      ) : (
        <ul className="list-disc pl-5 space-y-1">
          {items.map((it) => (
            <li key={it.date}>
              <Link className="underline" href={it.path}>
                {it.date}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

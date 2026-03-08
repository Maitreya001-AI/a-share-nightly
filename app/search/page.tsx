export default function SearchPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex gap-2 text-sm">
        <a href="/" className="rounded-lg border px-3 py-2 hover:bg-zinc-50">← 首页</a>
      </div>
      <h1 className="text-3xl font-bold">搜索（Beta）</h1>
      <p className="mt-3 text-zinc-700">已预留入口。下一步我会接本地索引（daily + insights）做关键词检索与标签筛选。</p>
    </main>
  );
}

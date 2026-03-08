import fs from 'node:fs';
import path from 'node:path';

/**
 * Minimal offline generator.
 * - Builds lightweight indices from existing content/*
 * - Does NOT call external APIs.
 */

type DailyIndexItem = { date: string; path: string; title?: string };

type Insight = {
  id: string;
  title: string;
  url: string;
  source?: string;
  authors?: string[];
  publishedAt?: string;
  summary?: string;
  quotes?: { text: string; where?: string }[];
  tags?: string[];
  status?: 'new' | 'triage' | 'kept' | 'rejected' | 'digested';
};

function readJson<T>(p: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const contentDir = path.join(repoRoot, 'content');

  const dailyDir = path.join(contentDir, 'daily');
  const dailyFiles = fs.existsSync(dailyDir)
    ? fs.readdirSync(dailyDir).filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort()
    : [];

  const dailyIndex: DailyIndexItem[] = dailyFiles.map((f) => {
    const date = f.replace(/\.md$/, '');
    return { date, path: `/daily/${date}` };
  });

  fs.writeFileSync(path.join(contentDir, 'daily', 'index.json'), JSON.stringify(dailyIndex, null, 2));

  const insightsPath = path.join(contentDir, 'insights', 'index.json');
  const insights = readJson<Insight[]>(insightsPath, []);
  const tagSet = new Set<string>();
  for (const it of insights) {
    for (const t of it.tags ?? []) tagSet.add(t);
  }
  const tags = Array.from(tagSet).sort();
  fs.writeFileSync(path.join(contentDir, 'insights', 'tags.json'), JSON.stringify(tags, null, 2));

  console.log(`[gen] daily=${dailyIndex.length} insights=${insights.length} tags=${tags.length}`);
}

main();

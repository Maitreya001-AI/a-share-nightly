import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

function sh(cmd, args, opts={}){
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore','pipe','pipe'], ...opts });
}

function parseTavilyOutput(md){
  // Extract URLs from the "Sources" section.
  const lines = md.split(/\r?\n/);
  const urls = [];
  for (const line of lines){
    const m = line.match(/https?:\/\/\S+/);
    if (m) urls.push(m[0].replace(/\)$/, ''));
  }
  // keep unique, stable order
  const seen = new Set();
  const out=[];
  for (const u of urls){
    if (!seen.has(u)) { seen.add(u); out.push(u); }
  }
  return out;
}

function main(){
  const repoRoot = process.cwd();
  const outDir = path.join(repoRoot, 'content', '_raw');
  fs.mkdirSync(outDir, { recursive: true });

  const args = process.argv.slice(2);
  const date = args[0] || new Date().toISOString().slice(0,10);

  const queries = [
    { key: 'market_recap', q: `A股 ${date} 复盘 涨停 跌停 连板 梯队 炸板率 成交额 板块 主线`, n: 10 },
    { key: 'ai_robot', q: `A股 AI应用 机器人 算力硬件 军工航天 涨价 有色 化工 新能源 医药 复盘 观点`, n: 10 },
    { key: 'microstructure', q: `A股 交易制度 异动 监管 价格笼子 程序化交易 量化 游资 影响 短线`, n: 10 },
    { key: 'sentiment_cycle', q: `A股 情绪周期 赚钱效应 市场高度 龙头 退潮 冰点 底层逻辑`, n: 10 },
  ];

  // Use existing tavily-search skill script
  const tavilyScript = '/Users/xrensiu/.openclaw/shared-skills/tavily-search/scripts/search.mjs';

  const results = [];
  for (const it of queries){
    const md = sh('node', [tavilyScript, it.q, '-n', String(it.n), '--deep']);
    const urls = parseTavilyOutput(md);
    const p = path.join(outDir, `${date}.${it.key}.tavily.md`);
    fs.writeFileSync(p, md);
    results.push({ key: it.key, query: it.q, urls, file: path.relative(repoRoot, p) });
  }

  const indexPath = path.join(outDir, `${date}.index.json`);
  fs.writeFileSync(indexPath, JSON.stringify({ date, generatedAt: new Date().toISOString(), queries: results }, null, 2));

  console.log(`[collect] wrote ${results.length} query outputs -> ${path.relative(repoRoot, indexPath)}`);
}

main();

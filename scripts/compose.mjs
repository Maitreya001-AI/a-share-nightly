import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

function readJson(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}

function writeJson(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

function sha1(s){
  return crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);
}

function extractAnswer(md){
  // Tavily output format:
  // ## Answer\n\n...\n\n---\n\n## Sources
  const m = md.match(/## Answer\s*\n([\s\S]*?)(?:\n---\n|\n## Sources\n)/);
  return (m ? m[1].trim() : '').replace(/\n{3,}/g,'\n\n');
}

function pickUrls(index){
  // B70%: prioritize microstructure + market_recap, then sentiment_cycle, then ai_robot.
  const order = ['microstructure','market_recap','sentiment_cycle','ai_robot'];
  const keyToUrls = new Map();
  for (const q of (index.queries || [])) keyToUrls.set(q.key, q.urls || []);

  const picked = [];
  const maxTotal = 12;
  const perKey = { microstructure: 4, market_recap: 3, sentiment_cycle: 3, ai_robot: 2 };

  for (const k of order){
    const urls = keyToUrls.get(k) || [];
    for (const u of urls){
      if (picked.length >= maxTotal) break;
      if (picked.includes(u)) continue;
      // Filter obvious low-signal sources
      if (/tags\.sina\.com\.cn\//.test(u)) continue;
      if (/stockstar\.com\/$/.test(u)) continue;
      picked.push(u);
      if ((picked.filter(x=> (keyToUrls.get(k)||[]).includes(x))).length >= (perKey[k]||2)) break;
    }
  }
  return picked;
}

function fetchText(url){
  // Use the Python fetcher-router CLI.
  const venv = '/Users/xrensiu/.openclaw/workspace/.venv/bin/activate';
  const py = '/Users/xrensiu/.openclaw/shared-skills/fetcher-router/fetch_url.py';
  const cmd = `source ${venv} && python ${py} "${url}" --json`;
  try {
    const out = execFileSync('bash', ['-lc', cmd], { encoding:'utf8', maxBuffer: 20*1024*1024 });
    return JSON.parse(out);
  } catch (e){
    return { url, ok:false, text:'', title:null, warnings:[String(e)] };
  }
}

function looksMojibake(s=''){
  return /Ã|Â|�|ã|æ|ç|ï¼|\u0000|\x00/.test(s);
}

function isLikelyBinary(s=''){
  return /%PDF-|JFIF|\u0000/.test(s);
}

function simpleSummary(text, max=500){
  const raw = String(text || '');
  if (!raw) return '';
  if (isLikelyBinary(raw)) return '';
  const t = raw.trim().replace(/\s+\n/g,'\n').replace(/\n{3,}/g,'\n\n');
  if (!t) return '';
  if (looksMojibake(t.slice(0, 300))) return '';
  return t.slice(0, max);
}

function inferTags(url, key){
  const tags = new Set();
  if (key === 'microstructure') tags.add('制度与微观结构');
  if (key === 'market_recap') tags.add('每日复盘');
  if (key === 'sentiment_cycle') tags.add('情绪周期');
  if (key === 'ai_robot') tags.add('赛道');

  if (/csrc\.gov\.cn|sse\.com\.cn|szse\.cn/.test(url)) tags.add('监管/规则');
  if (/nbd\.com\.cn|stcn\.com|21jingji\.com|caixin\.com|xinhuanet\.com/.test(url)) tags.add('媒体/制度');
  if (/xueqiu\.com/.test(url)) tags.add('雪球');
  if (/zhuanlan\.zhihu\.com/.test(url)) tags.add('知乎');
  if (/tgb\.cn/.test(url)) tags.add('淘股吧');
  if (/eastmoney\.com/.test(url)) tags.add('东方财富');

  return Array.from(tags);
}

function main(){
  const repoRoot = process.cwd();
  const date = process.argv[2];
  const tradingDate = process.argv[3] || date;
  if (!tradingDate) {
    console.error('usage: node scripts/compose.mjs <date> <tradingDate>');
    process.exit(2);
  }

  const rawDir = path.join(repoRoot, 'content', '_raw');
  const indexPath = path.join(rawDir, `${tradingDate}.index.json`);
  const index = readJson(indexPath, null);
  if (!index) {
    console.error(`[compose] missing ${path.relative(repoRoot,indexPath)}`);
    process.exit(2);
  }

  const dailyMdPath = path.join(repoRoot, 'content', 'daily', `${tradingDate}.md`);
  const insightsPath = path.join(repoRoot, 'content', 'insights', 'index.json');
  const handbookPath = path.join(repoRoot, 'content', 'handbook.md');

  const existingInsights = readJson(insightsPath, []);
  const existingByUrl = new Map(existingInsights.map(it => [it.url, it]));

  // Map queryKey -> answer text
  const answers = {};
  for (const q of index.queries || []){
    const mdFile = path.join(repoRoot, q.file);
    if (fs.existsSync(mdFile)){
      const md = fs.readFileSync(mdFile,'utf8');
      answers[q.key] = extractAnswer(md);
    }
  }

  const picked = pickUrls(index);

  // Build insights
  const newInsights = [];
  for (const url of picked){
    // figure which key it belongs to
    const key = (index.queries || []).find(q => (q.urls||[]).includes(url))?.key || 'misc';
    const fetched = fetchText(url);

    const id = sha1(url);
    const titleRaw = fetched.title || url;
    const title = looksMojibake(titleRaw) ? url : titleRaw;
    const summary = simpleSummary(fetched.text, 600);

    if (!summary && (isLikelyBinary(fetched.text || '') || /\.pdf(\?|$)/i.test(url))) {
      continue; // skip binary-like content such as PDF blobs
    }

    const insight = {
      id,
      title,
      url,
      source: key,
      summary,
      quotes: summary ? [{ text: summary.slice(0, 220) + (summary.length>220?'…':'') }] : [],
      tags: inferTags(url, key),
      status: 'new',
      fetchedAt: new Date().toISOString(),
      fetch: { ok: !!fetched.ok, strategy: fetched.strategy, status_code: fetched.status_code, warnings: fetched.warnings || [] }
    };

    if (existingByUrl.has(url)) {
      // keep existing status/tags if user already curated
      const old = existingByUrl.get(url);
      existingByUrl.set(url, { ...insight, status: old.status ?? insight.status, tags: old.tags ?? insight.tags });
    } else {
      newInsights.push(insight);
    }
  }

  const mergedInsights = [
    ...existingInsights.filter(it => !picked.includes(it.url)),
    ...Array.from(existingByUrl.values()).filter(it => picked.includes(it.url)),
    ...newInsights,
  ];

  // Keep stable order: newest first by fetchedAt
  mergedInsights.sort((a,b)=> String(b.fetchedAt||'').localeCompare(String(a.fetchedAt||'')));
  writeJson(insightsPath, mergedInsights);

  // Handbook: append a small "今日新增" section (non-destructive)
  const hb = fs.existsSync(handbookPath) ? fs.readFileSync(handbookPath,'utf8') : '# A股短线底层逻辑手册\n';
  const hbAppend = [
    '',
    '---',
    `## ${tradingDate} 新增素材（待你筛选/消化）`,
    '',
    '- 本日新增的“可迁移观点/制度变化/资金结构线索”会先进入 insights（status=new）。',
    '- 你把某条的 status 改成 kept/digested，我再把它写进“固定章节”里。',
    '',
    ...newInsights.slice(0,8).map(it => `- ${it.title}｜${it.url}`),
    ''
  ].join('\n');
  fs.writeFileSync(handbookPath, hb + hbAppend);

  // Daily report (template + answers)
  const md = [
    `# A股复盘（${tradingDate}｜自动生成草稿）`,
    '',
    '> 说明：这是 nightly 自动生成的“可编辑草稿”。不荐股；只输出观察池/情景推演/风险条件。',
    '',
    '## 1) 市场概览（来自多源摘要，待你校验）',
    answers.market_recap ? answers.market_recap : '（待补：未从 Tavily 结果中抽到 Answer）',
    '',
    '## 2) 结构与情绪（高度/赚钱效应/亏钱效应）',
    answers.sentiment_cycle ? answers.sentiment_cycle : '（待补）',
    '',
    '## 3) 制度与微观结构（B权重）',
    answers.microstructure ? answers.microstructure : '（待补）',
    '',
    '## 4) 赛道观察（AI应用/机器人/算力/军工/涨价/新能源/医药）',
    answers.ai_robot ? answers.ai_robot : '（待补）',
    '',
    '## 5) 观察池（非荐股）',
    '- AI应用：待你确认主线/分支；优先看“能带队的核心+容量趋势承接”。',
    '- 机器人：同上。',
    '- 算力硬件：同上。',
    '- 军工航天：同上。',
    '- 涨价周期（有色化工）：同上。',
    '- 新能源链：同上。',
    '- 医药：同上。',
    '',
    '## 6) 明日情景推演（不预测点位，只给条件）',
    '### 情景A：高度修复（市场敢做高度）',
    '- 触发条件：连板梯队不再断层；隔日溢价回暖；亏钱效应不扩散。',
    '- 应对：允许进攻（但仍以确认信号为主）。',
    '',
    '### 情景B：高度继续受压（只敢做低位/趋势）',
    '- 触发条件：高标持续负反馈；炸板率高；连板高度被压在 3-4 板。',
    '- 应对：偏防守，仓位收缩，重点看容量趋势的承接质量。',
    '',
    '### 情景C：混沌轮动（无主线）',
    '- 触发条件：题材一日游；板块快速切换；一致性差。',
    '- 应对：减少交易频次，只做确定性最高的“结构票”，其余观望。',
    '',
    '## 7) 本日引用与素材（可整理入口）',
    ...picked.map(u => `- ${u}`),
    '',
  ].join('\n');

  fs.mkdirSync(path.dirname(dailyMdPath), { recursive:true });
  fs.writeFileSync(dailyMdPath, md);

  console.log(`[compose] tradingDate=${tradingDate} picked=${picked.length} newInsights=${newInsights.length}`);
}

main();

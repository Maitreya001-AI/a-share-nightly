# A股短线雷达（Nightly）

一个“本地夜间生成 → push → Vercel 自动部署”的静态知识站，用来沉淀：
- A股短线底层逻辑手册（handbook）
- 每日复盘（daily）
- 真知灼见库（insights）

## 不做荐股
本站默认只输出：观察池 / 情景推演 / 风险条件，不提供明确买卖建议。

## 目录结构
- `content/daily/YYYY-MM-DD.md`：每日复盘
- `content/handbook.md`：底层逻辑手册
- `content/insights/index.json`：文章/观点卡片

## 本地生成
```bash
npm i
npm run gen
```

## Nightly（本地跑）
```bash
npm run nightly
```

`nightly` 做三件事：
1) 生成索引（离线，不联网）
2) git add/commit
3) git push

> 真正的“抓取/搜索/整理”脚本后续会补到 `scripts/`，并由你本地或 OpenClaw 在 23:00 调度执行。

## 调度（建议）
- 由 OpenClaw `cron` 在每天 23:00 触发一个 agentTurn，然后 agent 在本机执行：
  - Tavily 搜索（需要 `TAVILY_API_KEY`）
  - fetcher-router 抓正文
  - 写入 content/
  - `npm run nightly`

## 部署到 Vercel
1) Vercel 连接该 GitHub repo
2) Framework 选择 Next.js
3) Build Command: `npm run build`
4) Output: Next.js default

> 因为内容已经被 commit 进 repo，所以 Vercel 不需要任何密钥。

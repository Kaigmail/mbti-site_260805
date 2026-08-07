# 徒步&溜达风格测试

娱乐向类 MBTI 徒步人格测试网站。20 道题 → 15 对维度计分 → 12 种徒步人格标签之一 → 趣味报告 + 数据统计。

- **技术栈**:Node.js + Express + 原生 HTML/CSS/JS(零构建链,部署最稳)
- **数据库**:Supabase(PostgreSQL),本地开发可用 SQLite 兜底
- **部署**:扣子编程(code.coze.cn)网页应用

## 本地运行

```bash
npm install
# 方式 A:连 Supabase(需要 .env,见下)
node server/index.js
# 方式 B:纯本地 SQLite(不需要 .env)
DB_TYPE=sqlite node server/index.js
```

打开 http://localhost:3000

## 环境变量(.env,不进 git)

| 变量 | 说明 |
|---|---|
| `DB_TYPE` | `supabase`(生产)/ `sqlite`(本地兜底) |
| `SUPABASE_URL` | Supabase 项目地址,如 `https://xxxx.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | 以 `sb_publishable_` 开头的密钥 |
| `SUPABASE_SECRET_KEY` | 以 `sb_secret_` 开头的密钥(仅建表用,可留空) |

## API

- `GET /api/questions` — 20 道题
- `POST /api/result` — 提交答案(20 个 0/1/2),返回匹配结果
- `POST /api/save` — 保存测试记录(结果页渲染后异步调用)
- `GET /api/stats` — 统计(总数/各角色人数/占比)

## Supabase 初始化(仅首次)

在 Supabase 后台 SQL Editor 依次执行:
1. `docs/supabase_setup.sql` — 建表
2. `docs/supabase_policy.sql` — 匿名读写放行策略

## 目录结构

```
server/   后端(Express + 计分/匹配/数据库适配)
data/     本地 SQLite 数据(开发用)
public/   前端(首页/答题/结果/统计)
docs/     文档与 SQL 脚本
sketches/ 设计稿变体
```

## 协作记录

开发由 Hermes(产品/验收)+ Codex(编码)协作,全程记录在 `WORK_LOG.md`。

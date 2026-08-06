# Codex 任务卡 #1 · 后端(Express + 计分 + 匹配 + 数据库)

> 项目:徒步&溜达风格测试(类 MBTI)｜ 出卡:Hermes ｜ 日期:2026-08-05

## 工作目录
`D:\VibeCoding\mbti-site_260805`(git 仓库,main 分支)

## 目标
实现 Node.js + Express 后端:静态托管前端文件 + 3 个 API(题目、计分匹配、结果入库)。

## 现有文件(⚠️ 只读,绝对不要修改)
| 文件 | 内容 |
|---|---|
| `data/questions.json` | 20 道题,每题 3 选项,`options[].dimension` 是该选项加分的维度名 |
| `data/pairs.json` | 15 对对立维度,`a` 是预设侧(平局取 a) |
| `data/labels.json` | 12 个结果标签,含 `traits`(该标签的特征维度画像) |
| `docs/` | 素材归档,勿动 |

## 要创建的文件

### 1. `package.json`
- 依赖:`express`、`better-sqlite3`
- `"start": "node server/index.js"`
- `"type": "commonjs"`(用 require,不用 import)

### 2. `server/index.js` — Express 入口,端口 3000
- 静态托管:`public/`(前端页面)、`data/`(题目 JSON,前端直接 fetch)
- API:
  - `GET /api/questions` → 返回 `questions.json` 内容
  - `POST /api/result`,body `{"answers": [0|1|2 ×20]}` → 计分+匹配 → 返回结果标签完整信息(见下)
  - `POST /api/save`,body `{"code": "TURBO", "scores": {...}}` → 写入数据库 → 返回 `{"ok": true, "id": N}`
  - `GET /health` → `{"ok": true}`
- 统一 JSON 格式;中文全部 UTF-8

### 3. `server/scoring.js` — 计分逻辑
1. `answers[i]` 是第 i 题的选项下标(0/1/2),取 `questions[i].options[answers[i]].dimension`,该维度 +1
2. 全部 20 题累计后,按 `pairs.json` 的 15 对比较:分数高的一侧为该对倾向;**平局取 `a`(预设侧)**
3. 导出函数,输入 answers,输出 `{dimension_scores, tendencies}`
   - `dimension_scores`: {维度名: 分数}
   - `tendencies`: {维度对a名: "a"|"b"}(键用 a 侧维度名即可)

### 4. `server/matching.js` — 结果匹配(方案 A:特征画像加权)
1. 对 12 个标签,统计 `labels.json[].traits` 中命中用户倾向的数量:用户某对的倾向侧 == 该 trait 名,则 +1
2. 取命中数最高的标签;**同分取 labels.json 中靠前的**;全 0 兜底取 labels.json 第一个
3. 返回 `{code, name, hit_count}` + 该标签完整信息(labels.json 里整条)

### 5. `server/db.js` — 数据库适配层
- 环境变量 `DB_TYPE`:
  - 默认/`sqlite`:better-sqlite3,数据库文件 `data/results.db`,建表:
    ```sql
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      label_code TEXT NOT NULL,
      scores_json TEXT NOT NULL
    );
    ```
  - `coze`:扣子内置数据库(本期不实现,导出函数抛 `not implemented` 即可,留 TODO)
- 导出:`initDB()`(启动时调用)、`saveResult({code, scores})` → 返回插入的 id

## 验收标准(全部通过才算完成)
1. `npm install` 成功,`npm start` 启动无报错
2. `curl -X POST http://localhost:3000/api/result -H "Content-Type: application/json" -d '{"answers":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}'`
   → 返回 `code` = `TURBO`(全选 A 的预期结果)
3. `curl -X POST http://localhost:3000/api/save -H "Content-Type: application/json" -d '{"code":"TURBO","scores":{"a":1}}'` → `{"ok": true, "id": 1}`
4. 重启服务后,`data/results.db` 里记录仍在

## 约束
- **禁止修改 `data/*.json` 和 `docs/`**——文案是产品红线,一个字都不能改
- 代码注释用英文;输出中文内容必须 UTF-8
- **不要执行 git commit/push**(git 由宿主 Hermes 管理)
- 如果 better-sqlite3 安装失败(需要编译),报告问题即可,不要换数据库方案

## 完成后的报告格式
```
后端完成:
- 文件清单:...
- 验收 1/2/3/4 结果:...
- 遇到的坑:...
```

# Codex 任务卡 #2 · 前端(首页 / 测试页 / 结果页)

> 项目:徒步&溜达风格测试(类 MBTI)｜ 出卡:Hermes ｜ 日期:2026-08-05

## 工作目录
`D:\VibeCoding\mbti-site_260805`(git 仓库,main 分支)

## 背景(后端已完成,勿动)
- `server/` 已就绪:Express 静态托管 `public/` 和 `/data/`,端口 3000
- API:
  - `GET /api/questions` → `{"questions": [{id, text, options:[{label,text,dimension}]}]}`
  - `POST /api/result` body `{"answers":[0|1|2 ×20]}` → 返回**匹配到的完整标签对象**(code/name/share_tag/short_title/keywords/description/joke/might/advice/traits/hit_count)+ dimension_scores/tendencies
  - `POST /api/save` body `{"code":"TURBO","scores":{...}}` → `{"ok":true,"id":N}`
- 角色图:`public/images/characters/<CODE>.webp`(12 张,如 TURBO.webp)

## 目标:完成 public/ 下 3 个页面(纯静态 HTML/CSS/JS,无框架)

### 1. `index.html` 首页
- 标题:**徒步&溜达风格测试**
- 副标题:**用 3 到 5 分钟看看你的徒步路子像哪种精神状态**
- 说明文字:20 道题,测出你的娱乐向人格标签,适合自嘲、分享和朋友互测。
- 一个醒目的**开始测试**按钮 → 跳转 `test.html`

### 2. `test.html` 测试页
- 页面加载时 `fetch('/api/questions')` 拿题目
- **一次只显示 1 题**,每题 3 个选项按钮(A/B/C)
- 顶部:进度 **第 X / 20 题** + 进度条(当前题/20)
- 点击选项 → 记录答案 → 自动进入下一题(轻微过渡动画即可,不要复杂)
- **上一题**按钮:可返回修改答案(修改后从该题继续)
- 第 20 题答完 → 自动 `POST /api/result` 拿结果 → `POST /api/save` 存库 → 把结果对象放入 `sessionStorage` → 跳转 `result.html`
- 若 API 失败:页面显示友好错误提示,不白屏

### 3. `result.html` 结果页(⚠️ 截图分享优化,最重要)
从 `sessionStorage` 读取结果对象,按顺序展示:
1. 角色图(顶部居中,`/images/characters/<code>.webp`)
2. 英文标签 + 中文名(大字号,如 `TURBO · 暴走风火轮`)
3. 分享标签(#话题,灰色小字)
4. 短标题(斜体或加粗)
5. 3 个关键词(胶囊/标签样式)
6. 简短描述
7. 轻松吐槽(醒目一点的样式,这是最有趣的文案)
8. **你可能会这样** ×2(列表)
9. **行动建议** ×2(列表)
10. **重新测试**按钮 → 跳回 `index.html`(并清 sessionStorage)

**截图友好要求**:整页做成一张"结果卡片"感——主卡片包含角色图+标签+短标题+关键词+吐槽;下面分区展示描述/你可能会这样/行动建议;留白充足、色块分区(浅色背景卡 + 白卡内容);手机 375px 宽度下主要信息尽量一屏;不用深色背景。

### 样式要求(`public/css/style.css`)
- 清爽、年轻、有网感;浅色为主,山野绿意 + 暖色点缀
- **移动端优先**:375px 起,桌面宽度居中限宽(如 480px 卡片)
- 大按钮、大字号、圆角、柔和阴影;不用默认浏览器样式
- 杜绝"AI 味"设计:不要紫色渐变霓虹、不要玻璃拟态炫技、不要到处都是 emoji 动画
- 页面间样式统一(共用 style.css)

### 交互细节
- 禁止使用任何前端框架/构建工具(纯原生 JS)
- 所有文案**原样使用 API 返回内容**,不要改写、不要增删
- `sessionStorage` 键名建议 `mbti_result`;没有结果时访问 result.html → 自动跳回 index.html

## 验收标准(全部通过才算完成)
1. `npm start` 后浏览器打开 `http://localhost:3000/` 首页正常显示
2. 完整走一遍:开始测试 → 20 题 → 结果页,角色图显示正确
3. 测试页中途点"上一题"能回退修改,后续进度正确
4. 结果页在浏览器 375px 宽度(DevTools 手机模式)下排版正常
5. `curl http://localhost:3000/test.html` 等页面均 200

## 约束
- **禁止修改 `server/`、`data/`、`docs/`**——后端和数据是验收过的,一个字节都不要动
- 文案原样;代码注释用英文;不执行 git 操作
- 图片只用现有的 `public/images/characters/*.webp`,不要新造图

## 完成后的报告格式
```
前端完成:
- 文件清单:...
- 验收 1/2/3/4/5 结果:...
- 遇到的坑:...
```

# Codex 任务卡 #4 · 数据统计页

## 背景
项目:mbti-site_260805(徒步&溜达风格测试)。后端已完成 Supabase 接入,新增了统计接口。你的任务:做**统计页前端**(样式沿用现有"山野活力风"设计稿,参考 `sketches/001-shan-ye-vital/index.html` 和现有 `public/css/style.css`)。

## 后端接口(已就绪,契约固定)
`GET /api/stats` 返回:
```json
{
  "total": 42,
  "by_code": { "TURBO": 12, "WANDER": 5 },
  "percentages": { "TURBO": 0.2857, "WANDER": 0.119 }
}
```
- `total`:总测试人数
- `by_code`:各角色人数
- `percentages`:各角色占比(0~1 小数)

## 12 个角色(code → 中文名,写死在 stats.js 里)
TURBO=暴走风火轮, WANDER=迷路艺术家, DRAMA=脑内环游记, ZEN=行走的关机键,
RAGE=暴躁拖拉机, CHILL=雨天野餐家, GEAR=行走的装备库, RAW=荒野一阵风,
CREW=山野气氛组, SOLO=自带结界, SHOUT=山顶小喇叭, GENT=山野绅士

## 要做的
1. 新建 `public/stats.html` + `public/js/stats.js`,样式沿用 `public/css/style.css`(同款浅绿底/白卡片/圆角,山野活力风)
2. 统计页内容(从上到下):
   - 页面标题「📊 数据统计」+ 副标题「看看大家都走成什么样了」
   - **总测试人数**:大数字展示
   - **各角色列表**:12 个角色逐个显示(有数据的排前面),每行:角色中文名 + 人数 + 占比百分比
   - **角色分布图**:纯 CSS 横向条形图(div 宽度按占比%,不用任何图表库),颜色用森林绿 `#2d8a4e` 渐变橙 `#ff8c42`
   - 底部「← 返回测试」链接回首页
3. `public/index.html` 底部加一个入口链接「📊 数据统计」指向 `/stats.html`(样式:小字、灰绿色,不要抢「开始测试」按钮)
4. 处理空数据:`total === 0` 时显示「还没有测试数据,快来测一个吧!」+ 返回按钮
5. 移动端适配(375px 下条形图不溢出,列表可读)
6. 加载失败时显示错误提示 + 重试按钮

## 禁止
- 不要改 `server/`、`data/`、`docs/`
- 不要改 `public/js/result.js`、`public/js/test.js` 的现有逻辑
- 不要执行 git 操作
- 不要用内置浏览器截图验收(这台机器上会崩),用 curl 验证 API + 读文件核验

## 验收标准(逐条自测并报告)
1. `curl http://localhost:3000/api/stats` 返回 JSON(200)
2. stats.html 存在,页面结构完整(标题/总人数/角色列表/条形图/返回链接)
3. index.html 有统计入口链接
4. JS 语法无误(`node --check public/js/stats.js`)
5. 空数据/正常数据两种渲染逻辑都在代码里
6. 不用浏览器截图;报告用 curl + 文件内容作为证据

## 报告格式
逐条列出验收结果,给出证据(文件路径、curl 响应摘录)。

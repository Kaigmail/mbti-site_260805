-- ============================================
-- 徒步&溜达风格测试 · Supabase 建表脚本
-- 使用方法:登录 supabase.com → 进入你的项目 →
--   SQL Editor(左侧菜单)→ 粘贴全部内容 → Run
-- 只需执行一次,以后不用再管
-- ============================================

-- 测试结果表(每条 = 一次完整测试)
create table if not exists public.results (
  id bigint generated always as identity primary key,
  code text not null,                    -- 结果角色:TURBO / WANDER / ...
  name text,                             -- 中文名:暴走风火轮
  short_title text,                      -- 报告标题:速度是信仰,终点是执念
  keywords jsonb,                        -- 3 个关键词
  dimension_scores jsonb,                -- 15 对维度分数
  answers jsonb,                         -- 20 题答案(0/1/2)
  created_at timestamptz not null default now()  -- 完成时间(自动)
);

-- 按角色统计加速
create index if not exists idx_results_code on public.results (code);

-- 本表只存匿名测试记录(无姓名/手机号等隐私),允许公开读写即可
alter table public.results disable row level security;

-- ============================================
-- 徒步&溜达风格测试 · Supabase 放行策略(第 2 步)
-- 原因:新版 Supabase 强制行级安全(RLS),无法直接关闭
-- 改为添加"允许匿名读写"策略 —— 标准做法
-- 使用方法:SQL Editor → 粘贴全部 → Run
-- ============================================

-- 允许匿名用户(anon,即网站后端用 Publishable key)插入测试记录
create policy "allow anon insert results"
  on public.results
  for insert
  to anon
  with check (true);

-- 允许匿名用户查询测试记录(统计页用)
create policy "allow anon select results"
  on public.results
  for select
  to anon
  using (true);

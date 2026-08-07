'use strict';

const path = require('path');

const DB_TYPE = process.env.DB_TYPE || 'sqlite';

let db = null;
let supabase = null;

/**
 * 获取 Supabase 客户端(懒加载)。
 * 业务读写用 Publishable key(设计上可公开,配合 RLS/表权限使用)。
 */
function getSupabase() {
  if (supabase) return supabase;
  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error('Supabase 未配置:缺少 SUPABASE_URL 或 SUPABASE_PUBLISHABLE_KEY');
  }
  supabase = createClient(url, key);
  return supabase;
}

/**
 * 初始化数据库。启动时调用一次。
 * DB_TYPE=supabase → Supabase(表由 docs/supabase_setup.sql 创建,启动时检测)
 * DB_TYPE=sqlite(默认)→ 本地 data/results.db
 */
function initDB() {
  if (DB_TYPE === 'supabase') {
    // 启动时检测表是否存在(配置检查,不阻塞启动)
    getSupabase()
      .from('results')
      .select('id', { count: 'exact', head: true })
      .then(() => console.log('[db] Supabase 连接正常,results 表可用'))
      .catch((err) =>
        console.warn(
          '[db] Supabase 连接/表检查失败(不影响服务启动):',
          err.message,
          '— 请确认已执行 docs/supabase_setup.sql 创建 results 表'
        )
      );
    return supabase;
  }

  const Database = require('better-sqlite3');
  const dbPath = path.join(__dirname, '..', 'data', 'results.db');
  db = new Database(dbPath);
  db.prepare(
    `CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      label_code TEXT NOT NULL,
      scores_json TEXT NOT NULL
    )`
  ).run();
  return db;
}

/**
 * 保存一次测试结果。
 * Supabase:插入完整记录(code/中文名/报告标题/关键词/维度分/答案/时间)。
 * SQLite:保持原样(code + scores,兼容本地开发)。
 *
 * @param {{code: string, name?: string, short_title?: string, keywords?: Array,
 *          dimension_scores?: Object, answers?: Array}} result
 * @returns {Promise<number>} 新记录 id
 */
function saveResult({ code, name, short_title, keywords, dimension_scores, answers }) {
  if (DB_TYPE === 'supabase') {
    return getSupabase()
      .from('results')
      .insert({
        code,
        name: name || null,
        short_title: short_title || null,
        keywords: keywords || null,
        dimension_scores: dimension_scores || null,
        answers: answers || null,
      })
      .select('id')
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        return data.id;
      });
  }

  if (!db) {
    return Promise.reject(new Error('database is not initialized'));
  }
  const info = db
    .prepare('INSERT INTO results (label_code, scores_json) VALUES (?, ?)')
    .run(code, JSON.stringify(dimension_scores || {}));
  return Promise.resolve(info.lastInsertRowid);
}

/**
 * 统计:总人数 + 各角色人数 + 占比。
 * @returns {Promise<{total: number, by_code: Object<string, number>, percentages: Object<string, number>}>}
 */
function getStats() {
  if (DB_TYPE === 'supabase') {
    return (async () => {
      const sb = getSupabase();
      const { count, error: countErr } = await sb
        .from('results')
        .select('*', { count: 'exact', head: true });
      if (countErr) throw countErr;

      const { data, error } = await sb.from('results').select('code');
      if (error) throw error;

      const byCode = {};
      (data || []).forEach((row) => {
        byCode[row.code] = (byCode[row.code] || 0) + 1;
      });
      const total = count || data.length || 0;
      const percentages = {};
      Object.keys(byCode).forEach((code) => {
        percentages[code] = total > 0 ? byCode[code] / total : 0;
      });
      return { total, by_code: byCode, percentages };
    })();
  }

  if (!db) {
    return Promise.reject(new Error('database is not initialized'));
  }
  const total = db.prepare('SELECT COUNT(*) AS n FROM results').get().n;
  const rows = db
    .prepare('SELECT label_code AS code, COUNT(*) AS n FROM results GROUP BY label_code')
    .all();
  const byCode = {};
  rows.forEach((r) => {
    byCode[r.code] = r.n;
  });
  const percentages = {};
  Object.keys(byCode).forEach((code) => {
    percentages[code] = total > 0 ? byCode[code] / total : 0;
  });
  return Promise.resolve({ total, by_code: byCode, percentages });
}

module.exports = { initDB, saveResult, getStats };

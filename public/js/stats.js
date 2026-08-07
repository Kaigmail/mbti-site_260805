'use strict';

/**
 * 数据统计页 · 徒步&溜达风格测试
 * 拉取 GET /api/stats,渲染:总人数 / 各角色列表 / 纯 CSS 横向条形图。
 * 接口契约:{ total, by_code, percentages }(total 为人数,percentages 为 0~1 小数)
 */

// 12 个角色 code → 中文名(写死在前端)
const CODE_NAMES = {
  TURBO: '暴走风火轮',
  WANDER: '迷路艺术家',
  DRAMA: '脑内环游记',
  ZEN: '行走的关机键',
  RAGE: '暴躁拖拉机',
  CHILL: '雨天野餐家',
  GEAR: '行走的装备库',
  RAW: '荒野一阵风',
  CREW: '山野气氛组',
  SOLO: '自带结界',
  SHOUT: '山顶小喇叭',
  GENT: '山野绅士',
};

const DEFAULT_CODES = Object.keys(CODE_NAMES);
const body = document.getElementById('statsBody');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showLoading() {
  body.innerHTML = `
    <div class="state-box">
      <div class="spinner" aria-hidden="true"></div>
      <p class="state-title">统计加载中…</p>
    </div>
  `;
}

/** 0~1 小数 → 百分比字符串,如 0.2857 → "28.6" */
function toPercent(value) {
  const percent = (Number(value) || 0) * 100;
  const clamped = Math.min(Math.max(percent, 0), 100);
  return clamped.toFixed(1);
}

/** 正常数据:总人数大数字 + 各角色列表 + 横向条形图 */
function renderStats(data) {
  const total = Number(data.total) || 0;
  const byCode = data.by_code || {};
  const percentages = data.percentages || {};

  // 12 个角色逐个显示:有数据的排前面,再按人数从多到少
  const rows = DEFAULT_CODES
    .map((code) => ({
      code,
      name: CODE_NAMES[code] || code,
      count: Number(byCode[code]) || 0,
      percent: Number(percentages[code]) || 0,
    }))
    .sort((a, b) => {
      if ((a.count > 0) !== (b.count > 0)) {
        return a.count > 0 ? -1 : 1;
      }
      return b.count - a.count;
    });

  const listHtml = rows
    .map(
      (row) => `
      <li class="stat-row">
        <span class="name">${escapeHtml(row.name)}</span>
        <span class="count">${row.count} 人</span>
        <span class="percent">${toPercent(row.percent)}%</span>
      </li>`
    )
    .join('');

  const chartHtml = rows
    .map(
      (row) => `
      <li class="chart-row">
        <span class="name">${escapeHtml(row.name)}</span>
        <div class="chart-track" role="img"
             aria-label="${escapeHtml(row.name)} 占比 ${toPercent(row.percent)}%">
          <div class="chart-bar" style="width: ${toPercent(row.percent)}%"></div>
        </div>
        <span class="percent">${toPercent(row.percent)}%</span>
      </li>`
    )
    .join('');

  body.innerHTML = `
    <div class="stats-total">
      <span class="num">${total}</span>
      <span class="label">总测试人数</span>
    </div>
    <section class="stats-section" aria-label="各角色人数">
      <h2>🧭 各角色人数</h2>
      <ul class="stat-list">${listHtml}</ul>
    </section>
    <section class="stats-section" aria-label="角色分布图">
      <h2>📊 角色分布</h2>
      <ul class="chart-list">${chartHtml}</ul>
    </section>
  `;
}

/** 空数据:total === 0 时给出引导 + 返回按钮 */
function renderEmpty() {
  body.innerHTML = `
    <div class="state-box">
      <p class="state-title">🌱 还没有测试数据,快来测一个吧!</p>
      <p class="state-desc">完成一次测试后,这里就会出现统计。</p>
      <a class="btn btn-green" href="/test.html">开始测试</a>
    </div>
  `;
}

/** 加载失败:错误提示 + 重试按钮 */
function renderError() {
  body.innerHTML = `
    <div class="state-box">
      <p class="state-title">统计加载失败</p>
      <p class="state-desc">暂时无法获取统计数据,请检查网络后重试。</p>
      <button type="button" class="btn btn-green retry-btn">重试</button>
    </div>
  `;
  const retry = body.querySelector('.retry-btn');
  if (retry) {
    retry.addEventListener('click', loadStats);
  }
}

async function loadStats() {
  showLoading();
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!data || typeof data.total !== 'number') {
      throw new Error('invalid stats payload');
    }
    if (data.total === 0) {
      renderEmpty();
    } else {
      renderStats(data);
    }
  } catch (err) {
    console.error('Failed to load stats:', err);
    renderError();
  }
}

loadStats();

'use strict';
const STORAGE_KEY = 'mbti_result';
const TOTAL = 20;
let questions = [];
let answers = new Array(TOTAL).fill(null);
let current = 0;
let submitting = false;
let pendingAdvance = false;
const page = document.getElementById('page');
function showLoading(message) {
  page.innerHTML = `
    <div class="state-box">
      <div class="spinner" aria-hidden="true"></div>
      <p class="state-title">${message || '题目加载中…'}</p>
    </div>
  `;
}
function showError(title, desc, onRetry) {
  page.innerHTML = `
    <div class="state-box">
      <p class="state-title"></p>
      <p class="state-desc"></p>
      <button type="button" class="btn btn-green"></button>
    </div>
  `;
  const box = page.firstElementChild;
  box.querySelector('.state-title').textContent = title;
  box.querySelector('.state-desc').textContent = desc;
  const retry = box.querySelector('.btn');
  retry.textContent = '重试';
  retry.addEventListener('click', onRetry);
}
async function loadQuestions() {
  showLoading();
  try {
    const res = await fetch('/api/questions');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error('no questions');
    }
    questions = data.questions;
    renderQuestion(0);
  } catch (err) {
    console.error('Failed to load questions:', err);
    showError('题目加载失败', '请检查网络后重试。', loadQuestions);
  }
}
function renderQuestion(index) {
  current = index;
  pendingAdvance = false;
  const question = questions[index];
  const percent = ((index + 1) / TOTAL) * 100;
  const selectedIndex = answers[index];
  const optionsHtml = question.options
    .map((option, i) => {
      const label = option.label || String.fromCharCode(65 + i);
      const picked = selectedIndex === i ? ' picked' : '';
      return `
        <button type="button" class="opt${picked}" data-index="${i}">
          <span class="k">${label}</span>
          <span class="t"></span>
        </button>
      `;
    })
    .join('');
  page.innerHTML = `
    <div class="quiz-head">
      <span class="num">第 ${index + 1}/${TOTAL} 题</span>
      <span class="total">🧭 读题慢一点,选走心的</span>
    </div>
    <div class="track" role="progressbar" aria-valuemin="1" aria-valuemax="${TOTAL}"
         aria-valuenow="${index + 1}">
      <i style="width: ${percent}%"></i>
    </div>
    <div class="q-card">
      <p class="q"></p>
      <div class="options">
        ${optionsHtml}
      </div>
      <button type="button" class="back" ${index === 0 ? 'disabled' : ''}>← 上一题</button>
    </div>
  `;
  const questionText = page.querySelector('.q');
  questionText.textContent = question.text;
  const textSpans = page.querySelectorAll('.opt .t');
  question.options.forEach((option, i) => {
    textSpans[i].textContent = option.text;
  });
  const back = page.querySelector('.back');
  back.addEventListener('click', () => {
    if (submitting || pendingAdvance || current === 0) {
      return;
    }
    renderQuestion(current - 1);
  });
  const optionsBox = page.querySelector('.options');
  optionsBox.addEventListener('click', (event) => {
    if (submitting || pendingAdvance) {
      return;
    }
    const btn = event.target.closest('.opt');
    if (!btn) {
      return;
    }
    const chosen = Number(btn.dataset.index);
    answers[current] = chosen;
    btn.classList.add('picked');
    pendingAdvance = true;
    if (current < TOTAL - 1) {
      window.setTimeout(() => renderQuestion(current + 1), 180);
    } else {
      window.setTimeout(() => submitAnswers(), 240);
    }
  });
}
async function submitAnswers() {
  if (submitting) {
    return;
  }
  submitting = true;
  showLoading('正在计算你的徒步人格…');
  try {
    const resultRes = await fetch('/api/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    if (!resultRes.ok) {
      throw new Error(`HTTP ${resultRes.status}`);
    }
    const result = await resultRes.json();
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: result.code,
          scores: result.dimension_scores || {},
        }),
      });
    } catch (saveErr) {
      console.warn('Failed to save result:', saveErr);
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    window.location.href = '/result.html';
  } catch (err) {
    console.error('Failed to get result:', err);
    submitting = false;
    showError('结果计算失败', '暂时无法获取结果,请稍后重试。', () => {
      submitting = false;
      submitAnswers();
    });
  }
}
loadQuestions();

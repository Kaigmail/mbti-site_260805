'use strict';

const STORAGE_KEY = 'mbti_result';
const TOTAL = 20;

let questions = [];
let answers = new Array(TOTAL).fill(null);
let current = 0;
let submitting = false;
let pendingAdvance = false;

const page = document.getElementById('page');

function showLoading() {
  page.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'card state-box';

  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  spinner.setAttribute('aria-hidden', 'true');

  const title = document.createElement('p');
  title.className = 'state-title';
  title.textContent = '题目加载中…';

  box.append(spinner, title);
  page.appendChild(box);
}

function showError(title, desc, onRetry) {
  page.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'card state-box';

  const heading = document.createElement('p');
  heading.className = 'state-title';
  heading.textContent = title;

  const message = document.createElement('p');
  message.className = 'state-desc';
  message.textContent = desc;

  const retry = document.createElement('button');
  retry.className = 'btn btn-primary';
  retry.type = 'button';
  retry.textContent = '重试';
  retry.addEventListener('click', onRetry);

  box.append(heading, message, retry);
  page.appendChild(box);
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
  page.innerHTML = '';

  const head = document.createElement('div');
  head.className = 'quiz-head';

  const progressText = document.createElement('div');
  progressText.className = 'quiz-progress-text';
  const label = document.createElement('span');
  const num = document.createElement('strong');
  num.textContent = `第 ${index + 1} / ${TOTAL} 题`;
  const remain = document.createElement('span');
  remain.textContent = `还剩 ${TOTAL - index - 1} 题`;
  label.appendChild(num);
  progressText.append(label, remain);

  const track = document.createElement('div');
  track.className = 'progress-track';
  track.setAttribute('role', 'progressbar');
  track.setAttribute('aria-valuemin', '1');
  track.setAttribute('aria-valuemax', String(TOTAL));
  track.setAttribute('aria-valuenow', String(index + 1));
  const fill = document.createElement('div');
  fill.className = 'progress-fill';
  fill.style.width = `${((index + 1) / TOTAL) * 100}%`;
  track.appendChild(fill);

  head.append(progressText, track);

  const card = document.createElement('div');
  card.className = 'card question-card question-wrap';

  const questionText = document.createElement('p');
  questionText.className = 'question-text';
  questionText.textContent = question.text;

  const optionsBox = document.createElement('div');
  optionsBox.className = 'options';

  question.options.forEach((option, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option';
    btn.dataset.index = String(i);

    const labelChip = document.createElement('span');
    labelChip.className = 'opt-label';
    labelChip.textContent = option.label;

    const text = document.createElement('span');
    text.textContent = option.text;

    btn.append(labelChip, text);
    optionsBox.appendChild(btn);
  });

  card.append(questionText, optionsBox);

  const footer = document.createElement('div');
  footer.className = 'quiz-footer';
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'btn btn-ghost';
  back.textContent = '上一题';
  back.disabled = index === 0;
  back.addEventListener('click', () => {
    if (submitting || pendingAdvance || current === 0) {
      return;
    }
    renderQuestion(current - 1);
  });
  footer.appendChild(back);

  page.append(head, card, footer);

  // Highlight the previously chosen option when revisiting a question.
  const selectedIndex = answers[index];
  if (selectedIndex !== null) {
    const buttons = optionsBox.querySelectorAll('.option');
    const chosen = buttons[selectedIndex];
    if (chosen) {
      chosen.classList.add('selected');
    }
  }

  optionsBox.addEventListener('click', (event) => {
    if (submitting || pendingAdvance) {
      return;
    }
    const btn = event.target.closest('.option');
    if (!btn) {
      return;
    }
    const chosen = Number(btn.dataset.index);
    answers[current] = chosen;
    btn.classList.add('selected');
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

  page.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'card state-box';
  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  spinner.setAttribute('aria-hidden', 'true');
  const title = document.createElement('p');
  title.className = 'state-title';
  title.textContent = '正在计算你的徒步人格…';
  box.append(spinner, title);
  page.appendChild(box);

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

    // Persisting the result is best-effort; a failure must not block the
    // result page from showing the already-computed label.
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

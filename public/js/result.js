'use strict';
const STORAGE_KEY = 'mbti_result';
const ANSWERS_KEY = 'mbti_answers';
const page = document.getElementById('page');

function showToast(message, type) {
  let toast = document.querySelector('.save-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'save-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.toggle('toast-ok', type === 'ok');
  toast.classList.toggle('toast-fail', type === 'fail');
  toast.classList.add('toast-show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('toast-show'), 3200);
}

/**
 * 渲染结果页后异步保存记录:先展示报告,保存不阻塞用户。
 * 成功 → 轻提示"测试结果已保存"
 * 失败 → 提示"结果展示成功,但保存记录失败,请稍后再试",报告保留
 */
function saveResultAsync(result) {
  let answers = null;
  try {
    const raw = sessionStorage.getItem(ANSWERS_KEY);
    if (raw) answers = JSON.parse(raw);
  } catch (err) {
    answers = null;
  }
  fetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: result.code,
      name: result.name,
      short_title: result.short_title,
      keywords: result.keywords,
      dimension_scores: result.dimension_scores,
      answers,
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (data && data.ok) {
        showToast('测试结果已保存', 'ok');
      } else {
        showToast('结果展示成功,但保存记录失败,请稍后再试', 'fail');
      }
    })
    .catch(() => {
      showToast('结果展示成功,但保存记录失败,请稍后再试', 'fail');
    });
}

function redirectHome() {
  window.location.replace('/index.html');
}
function renderResult(result) {
  const code = typeof result.code === 'string' ? result.code : '';
  const name = typeof result.name === 'string' ? result.name : '';
  const shareTag = typeof result.share_tag === 'string' ? result.share_tag : '';
  const shortTitle = typeof result.short_title === 'string' ? result.short_title : '';
  const description = typeof result.description === 'string' ? result.description : '';
  const joke = typeof result.joke === 'string' ? result.joke : '';
  const keywords = Array.isArray(result.keywords) ? result.keywords : [];
  const might = Array.isArray(result.might) ? result.might : [];
  const advice = Array.isArray(result.advice) ? result.advice : [];
  page.innerHTML = `
    <div class="result-hero">
      <img class="avatar" alt="角色图:${name || code}"
           src="/images/characters/${encodeURIComponent(code)}.webp">
      <div class="code"></div>
      <div class="name"></div>
      <span class="share"></span>
      <p class="title"></p>
      <div class="kw"></div>
    </div>
    <div class="card">
      <h3>🧬 你的徒步人格</h3>
      <p class="desc-text"></p>
    </div>
    <div class="card joke">
      <h3>🗯️ 轻松吐槽</h3>
      <p class="joke-text"></p>
    </div>
    <div class="card">
      <h3>👀 你可能会这样</h3>
      <ul class="might-list"></ul>
    </div>
    <div class="card">
      <h3>🎯 行动建议</h3>
      <ul class="advice-list"></ul>
    </div>
    <button type="button" class="btn btn-green again">↻ 重新测试</button>
    <p class="foot">截图分享给朋友,看看TA是哪款</p>
  `;
  const hero = page.querySelector('.result-hero');
  const avatar = hero.querySelector('.avatar');
  avatar.addEventListener('error', () => {
    avatar.style.display = 'none';
  });
  hero.querySelector('.code').textContent = code;
  hero.querySelector('.name').textContent = name;
  hero.querySelector('.share').textContent = shareTag;
  hero.querySelector('.title').textContent = shortTitle;
  const kw = hero.querySelector('.kw');
  keywords.forEach((keyword) => {
    const pill = document.createElement('span');
    pill.textContent = keyword;
    kw.appendChild(pill);
  });
  page.querySelector('.desc-text').textContent = description;
  page.querySelector('.joke-text').textContent = joke;
  const mightList = page.querySelector('.might-list');
  might.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    mightList.appendChild(li);
  });
  const adviceList = page.querySelector('.advice-list');
  advice.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    adviceList.appendChild(li);
  });
  const again = page.querySelector('.again');
  again.addEventListener('click', () => {
    sessionStorage.removeItem(STORAGE_KEY);
    window.location.href = '/index.html';
  });
}
function init() {
  let result = null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      result = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Invalid stored result:', err);
  }
  if (!result || typeof result !== 'object' || !result.code) {
    redirectHome();
    return;
  }
  renderResult(result);
  saveResultAsync(result);
}
init();

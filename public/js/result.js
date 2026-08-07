'use strict';
const STORAGE_KEY = 'mbti_result';
const page = document.getElementById('page');
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
}
init();

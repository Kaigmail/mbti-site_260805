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
  const shortTitle =
    typeof result.short_title === 'string' ? result.short_title : '';
  const description =
    typeof result.description === 'string' ? result.description : '';
  const joke = typeof result.joke === 'string' ? result.joke : '';
  const keywords = Array.isArray(result.keywords) ? result.keywords : [];
  const might = Array.isArray(result.might) ? result.might : [];
  const advice = Array.isArray(result.advice) ? result.advice : [];

  const mainCard = document.createElement('section');
  mainCard.className = 'card result-main';

  const img = document.createElement('img');
  img.className = 'char-img';
  img.src = `/images/characters/${encodeURIComponent(code)}.webp`;
  img.alt = `角色图:${name || code}`;
  img.addEventListener('error', () => {
    img.style.display = 'none';
  });

  const title = document.createElement('h1');
  title.className = 'result-title';
  title.textContent = code && name ? `${code} · ${name}` : name || code;

  mainCard.append(img, title);

  if (shareTag) {
    const tag = document.createElement('p');
    tag.className = 'share-tag';
    tag.textContent = shareTag;
    mainCard.appendChild(tag);
  }

  if (shortTitle) {
    const short = document.createElement('p');
    short.className = 'short-title';
    short.textContent = shortTitle;
    mainCard.appendChild(short);
  }

  if (keywords.length > 0) {
    const pills = document.createElement('div');
    pills.className = 'keywords';
    keywords.forEach((keyword) => {
      const pill = document.createElement('span');
      pill.className = 'keyword';
      pill.textContent = keyword;
      pills.appendChild(pill);
    });
    mainCard.appendChild(pills);
  }

  if (joke) {
    const jokeBox = document.createElement('p');
    jokeBox.className = 'joke';
    jokeBox.textContent = joke;
    mainCard.appendChild(jokeBox);
  }

  page.appendChild(mainCard);

  if (description) {
    const section = document.createElement('section');
    section.className = 'card result-section';
    const heading = document.createElement('h2');
    heading.textContent = '简短描述';
    const body = document.createElement('p');
    body.textContent = description;
    section.append(heading, body);
    page.appendChild(section);
  }

  if (might.length > 0) {
    const section = document.createElement('section');
    section.className = 'card result-section';
    const heading = document.createElement('h2');
    heading.textContent = '你可能会这样';
    const list = document.createElement('ul');
    list.className = 'plain-list';
    might.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    });
    section.append(heading, list);
    page.appendChild(section);
  }

  if (advice.length > 0) {
    const section = document.createElement('section');
    section.className = 'card result-section';
    const heading = document.createElement('h2');
    heading.textContent = '行动建议';
    const list = document.createElement('ul');
    list.className = 'plain-list';
    advice.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    });
    section.append(heading, list);
    page.appendChild(section);
  }

  const actions = document.createElement('div');
  actions.className = 'result-actions';
  const retest = document.createElement('button');
  retest.type = 'button';
  retest.className = 'btn btn-primary';
  retest.textContent = '重新测试';
  retest.addEventListener('click', () => {
    sessionStorage.removeItem(STORAGE_KEY);
    window.location.href = '/index.html';
  });
  actions.appendChild(retest);
  page.appendChild(actions);
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

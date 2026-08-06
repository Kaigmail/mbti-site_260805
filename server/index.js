'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

const { score } = require('./scoring');
const { match } = require('./matching');
const { initDB, saveResult } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '100kb' }));

// Static hosting: frontend pages + raw data JSON (frontend fetches directly).
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/data', express.static(path.join(__dirname, '..', 'data')));

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/questions', (req, res) => {
  const questions = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'data', 'questions.json'), 'utf8')
  );
  res.json(questions);
});

app.post('/api/result', (req, res) => {
  const answers = req.body && req.body.answers;
  const valid =
    Array.isArray(answers) &&
    answers.length === 20 &&
    answers.every((value) => value === 0 || value === 1 || value === 2);

  if (!valid) {
    return res
      .status(400)
      .json({ ok: false, error: 'answers must be an array of 20 integers, each 0/1/2' });
  }

  try {
    const { dimension_scores, tendencies, strict_tendencies } = score(answers);
    const matched = match(strict_tendencies);
    res.json({ ...matched, dimension_scores, tendencies });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/save', (req, res) => {
  const { code, scores } = req.body || {};
  if (typeof code !== 'string' || code.length === 0) {
    return res.status(400).json({ ok: false, error: 'code is required' });
  }
  if (!scores || typeof scores !== 'object' || Array.isArray(scores)) {
    return res.status(400).json({ ok: false, error: 'scores must be an object' });
  }

  try {
    const id = saveResult({ code, scores });
    res.json({ ok: true, id });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

initDB();

app.listen(PORT, () => {
  console.log(`MBTI site server listening on http://localhost:${PORT}`);
});

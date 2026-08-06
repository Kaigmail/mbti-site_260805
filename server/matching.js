'use strict';

const fs = require('fs');
const path = require('path');

const labelsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'labels.json'), 'utf8')
);
const pairsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'pairs.json'), 'utf8')
);
const questionsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'questions.json'), 'utf8')
);

// Count how many times each dimension actually appears in the 20 questions.
// Pairs where one side never appears have no discriminative power (e.g.
// 记录型存在/沉浸型在场 — 沉浸型在场 has no question), so they must not
// influence matching; otherwise a "dead" trait gives free points to labels.
const dimCount = {};
for (const q of questionsData.questions) {
  for (const opt of q.options) {
    dimCount[opt.dimension] = (dimCount[opt.dimension] || 0) + 1;
  }
}
const validPairs = pairsData.pairs.filter(
  (p) => (dimCount[p.a] || 0) > 0 && (dimCount[p.b] || 0) > 0
);

/**
 * Match a user's tendencies against the 12 labels (scheme A: weighted portrait).
 *
 * For every pair the user wins, the winning trait name is collected. Each label
 * scores +1 per trait in its `traits` list that matches one of the user's
 * winning traits. The label with the highest hit count wins; ties resolve to
 * the earlier label in labels.json; a 0-hit fallback also returns the first
 * label. The returned object is the full label entry plus `hit_count`.
 *
 * @param {Object<string, 'a'|'b'>} tendencies - keyed by the pair's a-side name.
 * @returns {Object} full matched label entry + hit_count.
 */
function match(tendencies) {
  const winningTraits = new Set();
  for (const pair of validPairs) {
    const side = tendencies[pair.a];
    if (side === 'a') {
      winningTraits.add(pair.a);
    } else if (side === 'b') {
      winningTraits.add(pair.b);
    }
    // undefined (tie) → counts for nobody
  }

  let bestLabel = labelsData.labels[0];
  let bestScore = -1;
  let bestHits = -1;

  for (const label of labelsData.labels) {
    let hits = 0;
    for (const trait of label.traits) {
      if (winningTraits.has(trait)) {
        hits += 1;
      }
    }
    // score = hits + hits/traitCount: a fully-hit 2-trait label (2+1=3)
    // beats a partially-hit 3-trait label (2+0.67), while a fully-hit
    // 3-trait label (3+1=4) still wins overall. Fair for both small and
    // large portraits.
    const score = hits + hits / label.traits.length;
    if (score > bestScore) {
      bestScore = score;
      bestLabel = label;
      bestHits = hits;
    }
  }

  return { ...bestLabel, hit_count: bestHits };
}

module.exports = { match };

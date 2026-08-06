'use strict';

const fs = require('fs');
const path = require('path');

const questionsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'questions.json'), 'utf8')
);
const pairsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'pairs.json'), 'utf8')
);

/**
 * Score an array of answer indexes (one per question).
 *
 * Each answer selects an option whose `dimension` gains +1 point.
 * After accumulating all 20 questions, each pair in pairs.json is compared:
 * the side with the higher score wins that pair's tendency; ties default to "a".
 *
 * @param {number[]} answers - 20 integers, each 0/1/2 (option index).
 * @returns {{dimension_scores: Object<string, number>, tendencies: Object<string, 'a'|'b'>}}
 */
function score(answers) {
  const dimensionScores = {};

  questionsData.questions.forEach((question, i) => {
    const option = question.options[answers[i]];
    if (!option) {
      throw new Error(`Invalid answer index ${answers[i]} for question ${i + 1}`);
    }
    const dimension = option.dimension;
    dimensionScores[dimension] = (dimensionScores[dimension] || 0) + 1;
  });

  const tendencies = {};
  const strictTendencies = {};
  for (const pair of pairsData.pairs) {
    const aScore = dimensionScores[pair.a] || 0;
    const bScore = dimensionScores[pair.b] || 0;
    tendencies[pair.a] = aScore >= bScore ? 'a' : 'b';
    // Strict view: only genuinely won pairs count for matching. A 0:0 or
    // 1:1 tie (defaulted to 'a' above for display) must NOT count as a win,
    // otherwise untouched pairs give free trait hits to the a-side labels.
    if (aScore > bScore) {
      strictTendencies[pair.a] = 'a';
    } else if (bScore > aScore) {
      strictTendencies[pair.a] = 'b';
    }
  }

  return {
    dimension_scores: dimensionScores,
    tendencies,
    strict_tendencies: strictTendencies,
  };
}

module.exports = { score };

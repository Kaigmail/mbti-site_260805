'use strict';
// 随机答题分布模拟:检验匹配算法是否偏向少数标签
const { score } = require('../server/scoring');
const { match } = require('../server/matching');

const N = 10000;
const results = {};

for (let i = 0; i < N; i++) {
  const answers = Array.from({ length: 20 }, () => Math.floor(Math.random() * 3));
  const { strict_tendencies } = score(answers);
  const matched = match(strict_tendencies, answers.join(''));
  results[matched.code] = (results[matched.code] || 0) + 1;
}

const sorted = Object.entries(results).sort((a, b) => b[1] - a[1]);
console.log(`随机答题 ${N} 次的结果分布:`);
sorted.forEach(([code, n]) => {
  const bar = '█'.repeat(Math.round((n / N) * 50));
  console.log(code.padEnd(8), ((n / N) * 100).toFixed(1).padStart(5) + '%', bar);
});
console.log('---');
console.log('出现标签种类:', sorted.length, '/ 12');
const top3 = sorted.slice(0, 3).reduce((s, [, n]) => s + n, 0);
console.log('前 3 名合计占比:', ((top3 / N) * 100).toFixed(1) + '%');
const top1 = sorted[0][1];
console.log('第一名占比:', ((top1 / N) * 100).toFixed(1) + '%');

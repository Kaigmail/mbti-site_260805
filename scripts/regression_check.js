'use strict';
// 回归验证:确定性(同答案同结果)+ 已知用例
const { score } = require('../server/scoring');
const { match } = require('../server/matching');

function run(answers, label) {
  const { strict_tendencies } = score(answers);
  const r = match(strict_tendencies, answers.join(''));
  console.log(label.padEnd(12), '→', r.code, r.name, `(hits=${r.hit_count})`);
  return r.code;
}

console.log('=== 已知用例 ===');
run(Array(20).fill(0), '全A');
run(Array(20).fill(1), '全B');
run(Array(20).fill(2), '全C');

console.log('\n=== 确定性:同答案跑3次必须一致 ===');
const a = [0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2];
const s1 = run(a, '随机1');
const s2 = run(a, '随机2');
const s3 = run(a, '随机3');
console.log('三次一致:', s1 === s2 && s2 === s3 ? '✅' : '❌');

console.log('\n=== 边界:0命中(所有对平局)===');
const flat = [0, 0, 1, 1, 2, 2, 0, 0, 1, 1, 2, 2, 0, 0, 1, 1, 2, 2, 0, 0];
run(flat, '平局组合1');
run(flat, '平局组合2');

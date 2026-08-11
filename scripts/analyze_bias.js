'use strict';
// 分析:题目选项中的维度分布 vs 标签画像,找出随机分布偏差的根源
const fs = require('fs');
const path = require('path');

const questions = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'questions.json'), 'utf8')).questions;
const labels = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'labels.json'), 'utf8')).labels;

// 1. 统计每个维度在全部选项槽(60个)中出现的次数
const dimCount = {};
let totalSlots = 0;
questions.forEach((q) => {
  q.options.forEach((opt) => {
    dimCount[opt.dimension] = (dimCount[opt.dimension] || 0) + 1;
    totalSlots++;
  });
});

console.log('=== 维度在选项中出现次数(60 个选项槽) ===');
Object.entries(dimCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([d, n]) => console.log(d.padEnd(10), n, '次', '█'.repeat(n * 3)));

// 2. 每个标签的 traits 可被点亮的次数(该 trait 对应维度在题目中的出现次数)
console.log('\n=== 标签画像可点亮次数(随机答题下的理论命中机会) ===');
const labelInfo = labels.map((lb) => {
  let total = 0;
  lb.traits.forEach((t) => {
    total += dimCount[t] || 0;
  });
  return { code: lb.code, name: lb.name, traits: lb.traits, traitCount: lb.traits.length, slotTotal: total };
});
labelInfo.sort((a, b) => b.slotTotal - a.slotTotal);
labelInfo.forEach((l) => {
  console.log(l.code.padEnd(8), `${l.name}`.padEnd(8), '画像', l.traitCount, '个维度,共可点亮', l.slotTotal, '次');
});

// 3. 对偶维度检查:哪些"对"只在一侧出现(死对)
console.log('\n=== 维度对出现情况 ===');
const pairs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'pairs.json'), 'utf8'));
console.log('pairs.json 结构:', JSON.stringify(pairs).slice(0, 200));

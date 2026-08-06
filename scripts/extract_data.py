# -*- coding: utf-8 -*-
"""阶段0: 从附件提取题目/标签数据 → data/*.json,并校验"""
import json, re, sys, os

SRC = r"D:\VibeCoding\mbti-site_260805\docs\assets\Asset_Hikingman_Test&Lable.md"
OUT = r"D:\VibeCoding\mbti-site_260805\data"
os.makedirs(OUT, exist_ok=True)

with open(SRC, encoding="utf-8") as f:
    text = f.read()

# ---------- 1. 题目表格 ----------
questions = []
for line in text.splitlines():
    m = re.match(r"^\|\s*(\d{1,2})\s*\|", line)
    if not m:
        continue
    cells = [c.strip() for c in line.split("|")]
    # ['', 题号, 题目, A文本, A计分, B文本, B计分, C文本, C计分, '']
    if len(cells) < 9:
        continue
    qid = int(cells[1])
    opts = []
    for i, letter in enumerate(["A", "B", "C"]):
        opt_text = cells[3 + i * 2]
        score = cells[4 + i * 2]
        dm = re.sub(r"\+1$", "", score).strip()
        opts.append({"label": letter, "text": opt_text, "dimension": dm})
    questions.append({"id": qid, "text": cells[2], "options": opts})

questions.sort(key=lambda q: q["id"])

# ---------- 2. 15 对维度(来源:附件计分表,硬编码保证准确) ----------
pairs = [
    {"direction": "自我状态", "a": "目标引力", "b": "过程漫游"},
    {"direction": "自我状态", "a": "内心剧场", "b": "放空飞地"},
    {"direction": "自我状态", "a": "记录型存在", "b": "沉浸型在场"},
    {"direction": "情绪反应", "a": "暴躁破防", "b": "浪漫转念"},
    {"direction": "情绪反应", "a": "硬扛战神", "b": "柔顺休息侠"},
    {"direction": "情绪反应", "a": "外放尖叫型", "b": "安静融化型"},
    {"direction": "行动模式", "a": "破风卷王", "b": "溜达哲学家"},
    {"direction": "行动模式", "a": "轨迹强迫", "b": "灵光探索家"},
    {"direction": "行动模式", "a": "极简即自由", "b": "装满安全感"},
    {"direction": "社交能量", "a": "孤独充电宝", "b": "组团氛围灯"},
    {"direction": "社交能量", "a": "领队燕", "b": "跟随鱼"},
    {"direction": "社交能量", "a": "友善信号发射塔", "b": "结界礼貌员"},
    {"direction": "世界态度", "a": "拜访者谦逊", "b": "拥有者自信"},
    {"direction": "世界态度", "a": "安全感恋人", "b": "野趣赌徒"},
    {"direction": "世界态度", "a": "极致无痕强迫症", "b": "温柔尽力派"},
]

# ---------- 3. 12 标签(方案A特征画像来自 PRD 已确认表) ----------
TRAITS = {
    "TURBO": ["破风卷王", "目标引力", "硬扛战神"],
    "WANDER": ["灵光探索家", "过程漫游", "野趣赌徒"],
    "DRAMA": ["内心剧场", "记录型存在"],
    "ZEN": ["放空飞地", "安静融化型"],
    "RAGE": ["暴躁破防", "硬扛战神", "破风卷王"],
    "CHILL": ["柔顺休息侠", "浪漫转念", "溜达哲学家"],
    "GEAR": ["轨迹强迫", "装满安全感", "极致无痕强迫症"],
    "RAW": ["极简即自由", "野趣赌徒"],
    "CREW": ["组团氛围灯", "友善信号发射塔"],
    "SOLO": ["孤独充电宝", "结界礼貌员"],
    "SHOUT": ["外放尖叫型", "友善信号发射塔"],
    "GENT": ["拜访者谦逊", "温柔尽力派", "安静融化型"],
}

labels = []
for sec in re.split(r"\r?\n### ", text)[1:]:
    m = re.match(r"^([A-Z]+) · (.+)", sec.strip())
    if not m:
        continue
    code, name = m.group(1), m.group(2)
    def field(key):
        mm = re.search(r"\*\*" + key + r"\*\*：(.+)", sec)
        return mm.group(1).strip() if mm else ""
    def list_field(key):
        # 找到该字段下的编号子项(截到下一个 **字段** 前)
        idx = sec.find("**" + key + "**")
        if idx < 0:
            return []
        rest = sec[idx:]
        nxt = rest.find("\n- **")
        if nxt > 0:
            rest = rest[:nxt]
        items = re.findall(r"^\s*(\d+)\.\s*(.+)$", rest, re.M)
        return [it[1].strip() for it in items]
    labels.append({
        "code": code,
        "name": name,
        "share_tag": field("分享标签"),
        "short_title": field("短标题"),
        "keywords": [k.strip() for k in field("关键词").split("、")],
        "description": field("简短描述"),
        "joke": field("轻松吐槽"),
        "might": list_field("你可能会这样"),
        "advice": list_field("行动建议"),
        "traits": TRAITS[code],
    })

# ---------- 4. 保存 ----------
with open(os.path.join(OUT, "questions.json"), "w", encoding="utf-8") as f:
    json.dump({"questions": questions}, f, ensure_ascii=False, indent=2)
with open(os.path.join(OUT, "pairs.json"), "w", encoding="utf-8") as f:
    json.dump({"pairs": pairs}, f, ensure_ascii=False, indent=2)
with open(os.path.join(OUT, "labels.json"), "w", encoding="utf-8") as f:
    json.dump({"labels": labels}, f, ensure_ascii=False, indent=2)

# ---------- 5. 校验 ----------
errors = []
if len(questions) != 20:
    errors.append(f"题目数 {len(questions)} != 20")
for q in questions:
    if len(q["options"]) != 3:
        errors.append(f"题{q['id']} 选项数 != 3")
    for o in q["options"]:
        if not o["text"] or not o["dimension"]:
            errors.append(f"题{q['id']} 选项{o['label']} 文本/维度为空")
if len(pairs) != 15:
    errors.append(f"维度对数 {len(pairs)} != 15")
if len(labels) != 12:
    errors.append(f"标签数 {len(labels)} != 12")

all_dims = set()
for p in pairs:
    all_dims.add(p["a"]); all_dims.add(p["b"])
for q in questions:
    for o in q["options"]:
        if o["dimension"] not in all_dims:
            errors.append(f"题{q['id']}{o['label']} 维度 '{o['dimension']}' 不在15对维度表中")
for lb in labels:
    for field in ["share_tag", "short_title", "description", "joke"]:
        if not lb[field]:
            errors.append(f"{lb['code']} {field} 为空")
    if len(lb["keywords"]) != 3:
        errors.append(f"{lb['code']} 关键词数 != 3")
    if len(lb["might"]) != 2:
        errors.append(f"{lb['code']} 你可能会这样数 = {len(lb['might'])}")
    if len(lb["advice"]) != 2:
        errors.append(f"{lb['code']} 行动建议数 = {len(lb['advice'])}")
    for t in lb["traits"]:
        if t not in all_dims:
            errors.append(f"{lb['code']} 特征维度 '{t}' 不在维度表中")

print("=== 提取结果 ===")
print(f"题目: {len(questions)} 道, 题号 {questions[0]['id']}~{questions[-1]['id']}")
print(f"维度对: {len(pairs)} 对")
print(f"标签: {len(labels)} 个: {', '.join(l['code'] for l in labels)}")
print(f"标签特征画像: {', '.join(l['code'] + '(' + str(len(l['traits'])) + ')' for l in labels)}")
print()
if errors:
    print("❌ 校验失败:")
    for e in errors:
        print("  -", e)
    sys.exit(1)
print("✅ 校验全部通过")

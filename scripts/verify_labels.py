# -*- coding: utf-8 -*-
"""阶段3 v2: 12 标签全覆盖验证——贪心构造干净用例(目标标签最高,他人尽量低)"""
import json, urllib.request

BASE = "http://localhost:3000"

questions = json.load(open(r"D:\VibeCoding\mbti-site_260805\data\questions.json", encoding="utf-8"))["questions"]
pairs = json.load(open(r"D:\VibeCoding\mbti-site_260805\data\pairs.json", encoding="utf-8"))["pairs"]
labels = json.load(open(r"D:\VibeCoding\mbti-site_260805\data\labels.json", encoding="utf-8"))["labels"]

trait_questions = {}
for q in questions:
    for oi, o in enumerate(q["options"]):
        trait_questions.setdefault(o["dimension"], []).append((q["id"], oi))

def calc_hits(ans):
    dims = {}
    for q, oi in zip(questions, ans):
        if oi is None:
            continue
        d = q["options"][oi]["dimension"]
        dims[d] = dims.get(d, 0) + 1
    win = set()
    for p in pairs:
        a_s = dims.get(p["a"], 0)
        b_s = dims.get(p["b"], 0)
        if a_s > b_s:
            win.add(p["a"])
        elif b_s > a_s:
            win.add(p["b"])
        # tie → counts for nobody (matches server strict logic)
    return {lb["code"]: sum(1 for t in lb["traits"] if t in win) for lb in labels}

def build_answers(target):
    ans = [None] * 20
    chosen = set()
    for t in target["traits"]:
        for qid, oi in trait_questions.get(t, []):
            if qid - 1 not in chosen:
                ans[qid - 1] = oi
                chosen.add(qid - 1)
                break
    for i in range(20):
        if ans[i] is not None:
            continue
        best = None
        for oi in (0, 1, 2):
            tmp = ans[:]
            tmp[i] = oi
            h = calc_hits(tmp)
            target_hit = h[target["code"]]
            others_max = max(v for k, v in h.items() if k != target["code"])
            key = (target_hit, -others_max)
            if best is None or key > best[0]:
                best = (key, oi)
        ans[i] = best[1]
    return ans

def post_result(answers):
    req = urllib.request.Request(
        BASE + "/api/result",
        data=json.dumps({"answers": answers}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as r:
        return json.load(r)

fail = []
print(f"{'目标':8s} {'实际':8s} 命中分布")
for label in labels:
    ans = build_answers(label)
    got = post_result(ans)
    ok = got["code"] == label["code"]
    hits = calc_hits(ans)
    top3 = sorted(hits.items(), key=lambda kv: -kv[1])[:3]
    dist = ", ".join(f"{k}:{v}" for k, v in top3)
    mark = "✅" if ok else "❌"
    print(f"{mark} {label['code']:6s} -> {got['code']:6s} | {dist}")
    if not ok:
        fail.append((label["code"], got["code"]))

print()
if fail:
    print("❌ 未通过:", fail)
else:
    print("✅ 12 个标签全部可命中")

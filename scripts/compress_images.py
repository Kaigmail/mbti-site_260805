# -*- coding: utf-8 -*-
"""阶段0: 12张角色图 PNG → webp(移动端加载性能,单张 <300KB)"""
import os
from PIL import Image

SRC_DIR = r"D:\VibeCoding\mbti-site_260805\docs\assets\characters"
OUT_DIR = r"D:\VibeCoding\mbti-site_260805\public\images\characters"
os.makedirs(OUT_DIR, exist_ok=True)

MAX_WIDTH = 600  # 结果页展示宽度足够(手机 375px 两倍屏)
QUALITY = 80

total_before = 0
total_after = 0
for fn in sorted(os.listdir(SRC_DIR)):
    if not fn.lower().endswith(".png"):
        continue
    code = os.path.splitext(fn)[0]
    src = os.path.join(SRC_DIR, fn)
    dst = os.path.join(OUT_DIR, code + ".webp")
    before = os.path.getsize(src)
    with Image.open(src) as im:
        w, h = im.size
        if w > MAX_WIDTH:
            nh = round(h * MAX_WIDTH / w)
            im = im.resize((MAX_WIDTH, nh), Image.LANCZOS)
        im.save(dst, "WEBP", quality=QUALITY, method=6)
    after = os.path.getsize(dst)
    total_before += before
    total_after += after
    print(f"{code:8s} {w}x{h}  {before//1024}KB -> {after//1024}KB  {'OK' if after < 300*1024 else '⚠️ 仍偏大'}")

print(f"\n合计: {total_before//1024//1024}MB -> {total_after//1024}KB")

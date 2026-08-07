#!/usr/bin/env python3
"""Codex 进度监控(watchdog):只在异常时输出,正常时静默。
- Codex 进程消失 → 通知(完成/崩溃)
- 进程在跑但超过 12 分钟无文件变化 → 警告(可能卡住)
"""
import json
import os
import subprocess
import sys
import time

PROJECT = r"D:\VibeCoding\mbti-site_260805"
STATE_FILE = os.path.join(PROJECT, ".codex_monitor.json")
IDLE_WARN_MIN = 12  # 超过 N 分钟无文件变化 → 警告
WARN_COOLDOWN_MIN = 60  # 同一警告 1 小时内不重复


def codex_running():
    try:
        out = subprocess.run(
            ["tasklist", "/FI", "IMAGENAME eq codex.exe", "/FO", "CSV"],
            capture_output=True, text=True, encoding="gbk", errors="replace",
            timeout=30,
        ).stdout.lower()
        return "codex.exe" in out
    except Exception:
        return None  # 未知


def latest_change():
    latest = 0.0
    for root, dirs, files in os.walk(PROJECT):
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules")]
        for f in files:
            try:
                latest = max(latest, os.path.getmtime(os.path.join(root, f)))
            except OSError:
                pass
    return latest


def main():
    state = {}
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, encoding="utf-8") as fh:
                state = json.load(fh)
        except Exception:
            state = {}

    now = time.time()
    running = codex_running()
    idle_min = (now - latest_change()) / 60

    msg = None

    if running is None:
        # 检查失败,不打扰
        pass
    elif running:
        # 新任务开始:重置完成标记
        if state.get("last_notified") == "finished":
            state["last_notified"] = None
        # 卡住警告
        if idle_min > IDLE_WARN_MIN:
            last_warn = state.get("last_idle_warn", 0)
            if now - last_warn > WARN_COOLDOWN_MIN * 60:
                msg = ("⚠️ Codex 疑似卡住:进程在运行,但已 "
                       f"{int(idle_min)} 分钟没有写任何文件。"
                       "可以对 Ada 说「看下 Codex 进度」检查。")
                state["last_idle_warn"] = now
    else:
        # 进程已结束
        if state.get("last_notified") != "finished":
            msg = "✅ Codex 进程已结束。可以对 Ada 说「Codex 跑完了吗」查看验收结果。"
            state["last_notified"] = "finished"

    with open(STATE_FILE, "w", encoding="utf-8") as fh:
        json.dump(state, fh, ensure_ascii=False)

    if msg:
        print(msg)
    # 空输出 = 静默(no_agent watchdog 模式)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Build the Docklet Liquid APK: the Liquid search flow (`Docklet Liquid.dc.html`) as its own app.

The page loads two helper scripts beside the runtime (docklet-liquid.js, docklet-sprite.js); they ship
next to index.html. Everything else is processed exactly like the playground (see build.process_page).

Output: liquid-app/assets/www (staging) and android/build-liquid/docklet-liquid.apk.
The app id is com.docklet.liquid.design, so it installs next to the playground and the recorder.

Usage: python3 build_liquid.py [export.dc.html]
"""
import os, shutil, subprocess, sys

import build

ROOT = build.ROOT
SRC = "Docklet Liquid.dc.html"
STAGE_BASE = os.path.join(ROOT, "liquid-app")
STAGE = os.path.join(STAGE_BASE, "assets", "www")
APK_OUT = os.path.join(ROOT, "android", "build-liquid")
APP_ID = "com.docklet.liquid.design"
APP_LABEL = "Docklet Liquid"
APK_NAME = "docklet-liquid.apk"
ICONS = ["manifest.webmanifest", "icon-192.png", "icon-512.png", "app-icon.png"]


def main():
    src_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, SRC)
    html, inlined = build.process_page(open(src_path, encoding="utf-8").read())
    shutil.rmtree(STAGE_BASE, ignore_errors=True)
    os.makedirs(STAGE)
    open(os.path.join(STAGE, "index.html"), "w", encoding="utf-8").write(html)
    open(os.path.join(STAGE, "support.js"), "w", encoding="utf-8").write(build.patched_runtime())
    for name in build.VENDOR:
        shutil.copy(os.path.join(ROOT, "vendor", name), STAGE)
    for name in build.helper_scripts(html):
        shutil.copy(os.path.join(ROOT, name), STAGE)
        print("helper      : " + name)
    for name in ICONS:
        shutil.copy(os.path.join(ROOT, "dist-app", name), STAGE)
    for folder in build.SHIPPED_DIRS:
        shutil.copytree(os.path.join(ROOT, folder), os.path.join(STAGE, folder))
    print("page        : %s  %.1f KB (%d assets inlined)" % (os.path.basename(src_path), len(html.encode()) / 1024, inlined))

    env = dict(os.environ, APP_ID=APP_ID, APP_LABEL=APP_LABEL, ASSET_BASE=STAGE_BASE, VERSION_KEY="liquid", PREDICTIVE_BACK="1",
               OUT=APK_OUT, APK_NAME=APK_NAME)
    subprocess.run(["bash", os.path.join(ROOT, "android", "make_apk.sh")], env=env, check=True)


if __name__ == "__main__":
    main()

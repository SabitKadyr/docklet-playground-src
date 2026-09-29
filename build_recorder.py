#!/usr/bin/env python3
"""Build the Docklet Recorder APK: the gesture recorder as its own app beside the playground.

The recorder (`BoBw Gesture Recorder.dc.html`) loads one of the playground exports into an iframe
by relative path and records pointer events through `contentWindow`, so every page in its PAGES
list must ship beside it, processed exactly like the playground (see build.process_page).

Output: recorder-app/assets/www (staging) and android/build-recorder/docklet-recorder.apk.
The app id is com.docklet.recorder, so it installs next to com.docklet.app.

Usage: python3 build_recorder.py [recorder-export.dc.html]
"""
import os, re, shutil, subprocess, sys

import build

ROOT = build.ROOT
RECORDER_SRC = "BoBw Gesture Recorder.dc.html"
STAGE_BASE = os.path.join(ROOT, "recorder-app")
STAGE = os.path.join(STAGE_BASE, "assets", "www")
APK_OUT = os.path.join(ROOT, "android", "build-recorder")
APP_ID = "com.docklet.recorder"
APP_LABEL = "Docklet Recorder"
APK_NAME = "docklet-recorder.apk"

# Android WebView ignores <a download href="blob:..."> and has no navigator.share, which is how
# the recorder exports JSON/CSV. Route blob downloads to the wrapper's DockletNative.save bridge,
# which writes them to Downloads/Docklet Recorder.
DOWNLOAD_SHIM = '''<title>Docklet Recorder</title>
<script>
(function () {
  if (!window.DockletNative) return;
  var click = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    var name = this.getAttribute("download"), href = this.href || "";
    if (name === null || href.indexOf("blob:") !== 0) return click.call(this);
    fetch(href).then(function (r) { return r.blob(); }).then(function (b) {
      var fr = new FileReader();
      fr.onload = function () {
        var s = String(fr.result);
        window.DockletNative.save(name || "export", b.type || "", s.slice(s.indexOf(",") + 1));
      };
      fr.readAsDataURL(b);
    }).catch(function (e) { console.error("DockletNative save failed", e); });
  };
})();
</script>
'''


def main():
    src_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, RECORDER_SRC)
    if not os.path.exists(src_path):
        raise SystemExit("missing recorder source: " + src_path)
    recorder = open(src_path, encoding="utf-8").read()
    pages = re.findall(r'\[\s*"[^"]*"\s*,\s*"([^"]+\.dc\.html)"\s*\]', recorder)
    if not pages:
        raise SystemExit("no PAGES list found in the recorder - did the export format change?")

    shutil.rmtree(STAGE_BASE, ignore_errors=True)
    os.makedirs(STAGE)

    print("recorder    : " + os.path.basename(src_path))
    html, _ = build.process_page(recorder, head_extra=DOWNLOAD_SHIM)
    open(os.path.join(STAGE, "index.html"), "w", encoding="utf-8").write(html)

    missing = []
    for name in pages:
        path = os.path.join(ROOT, name)
        if not os.path.exists(path):
            missing.append(name)
            print("WARNING page missing, its entry will show a blank frame: " + name)
            continue
        html, inlined = build.process_page(open(path, encoding="utf-8").read(), head_extra="")
        open(os.path.join(STAGE, name), "w", encoding="utf-8").write(html)
        print("page        : %-36s %6.1f KB (%d assets inlined)" % (name, len(html.encode()) / 1024, inlined))

    open(os.path.join(STAGE, "support.js"), "w", encoding="utf-8").write(build.patched_runtime())
    for name in build.VENDOR:
        shutil.copy(os.path.join(ROOT, "vendor", name), os.path.join(STAGE, name))
    for folder in build.SHIPPED_DIRS:
        shutil.copytree(os.path.join(ROOT, folder), os.path.join(STAGE, folder))

    env = dict(os.environ, APP_ID=APP_ID, APP_LABEL=APP_LABEL, ASSET_BASE=STAGE_BASE,
               OUT=APK_OUT, APK_NAME=APK_NAME)
    subprocess.run(["bash", os.path.join(ROOT, "android", "make_apk.sh")], env=env, check=True)
    if missing:
        print("\n%d page(s) missing: %s" % (len(missing), ", ".join(missing)))


if __name__ == "__main__":
    main()

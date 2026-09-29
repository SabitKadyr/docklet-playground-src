#!/usr/bin/env python3
"""Build dist-app/ (APK input) from a Docklet HTML export.

Source defaults to 'Best of Both Worlds.dc.html'; pass another export as argv[1].

Inlines every assets/* reference as a data URI so the shipped page has no
local asset dependencies. support.js is copied, NOT inlined: the runtime locates
the component template by regex-scanning the document for "<x-dc", and its own
source contains that literal, so inlining makes the scan swallow the runtime.
"""
import base64, mimetypes, os, re, shutil, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
DEFAULT_SRC = "Best of Both Worlds.dc.html"
OUT = os.path.join(ROOT, "dist-app")
ANDROID_ASSETS = os.path.join(ROOT, "android", "app", "src", "main", "assets", "www")

# support.js checks window.__resources before reaching for unpkg, so mapping the
# CDN URLs to local files is all it takes to make the payload fully offline.
RESOURCES = '''<script>
window.__resources = {
  "https://unpkg.com/react@18.3.1/umd/react.production.min.js": "./react.production.min.js",
  "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js": "./react-dom.production.min.js"
};
</script>
'''

VENDOR = ["react.production.min.js", "react-dom.production.min.js"]

# Asset folders the export reaches with a URL it assembles at runtime, so they cannot be inlined.
SHIPPED_DIRS = ["assets/settings", "assets/pocket"]

# Performance patches applied to every export. Each one must remove work without changing the
# design, and one whose anchor is gone is reported and skipped rather than failing the build.
#
# Empty since the 2026-09-23 export: the double render (setState + forceUpdate) and the camera
# <video> resizing every frame are both fixed in the design source now. The camera patch in
# particular must not come back — the tile no longer morphs 110 -> 66, it pops in, and scaling the
# video inside it would add a zoom that is not in the design.
PERF_PATCHES = []

PREV_STATE_ANCHOR = """  componentDidUpdate(pp, ps) {
    const st = this.state;
"""
PREV_STATE_SHIM = """  componentDidUpdate(pp) {
    const st = this.state;
    const ps = this.__prevState || {};
    this.__prevState = st;
"""

HEAD_EXTRA = '''<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#0b0c0f">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="icon-192.png">
<title>Docklet</title>
'''

# Web build only. Inside the APK every byte is already local, so a cache-first
# service worker buys nothing and actively hurts: it would keep serving the
# previous index.html out of its cache after an app update.
SW_REGISTER = '''<script>
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./sw.js").catch(function () {});
  });
}
</script>
'''


def process_page(src, head_extra=HEAD_EXTRA):
    """Turn one Claude Design export into an offline page (the APK variant, no service worker).

    Returns (html, number_of_inlined_assets). Shared by main() and build_recorder.py, so every
    page the gesture recorder embeds gets exactly the same treatment as the playground itself.
    """
    inlined = 0
    for path in sorted(set(re.findall(r"assets/[A-Za-z0-9._/-]+", src))):
        # A bare folder is the export building a URL at runtime ("./assets/settings/" + icon);
        # those files ship beside index.html instead, see SHIPPED_DIRS.
        if path.endswith("/"):
            continue
        full = os.path.join(ROOT, path)
        if not os.path.exists(full):
            # Left as a relative URL so the page still builds; a file dropped into assets/ later is
            # picked up by the next build (the folders in SHIPPED_DIRS travel with index.html).
            print("WARNING missing asset, left as a file reference: " + path)
            continue
        mime = "image/svg+xml" if path.endswith(".svg") else mimetypes.guess_type(path)[0]
        b64 = base64.b64encode(open(full, "rb").read()).decode()
        src = src.replace(path, "data:%s;base64,%s" % (mime, b64))
        inlined += 1

    # dc-runtime invokes componentDidUpdate(prevProps) with no prevState, so an
    # export written as componentDidUpdate(pp, ps) throws on its first ps.* read
    # and the hook (camera start, appsIn animation) never runs. Shim it until the
    # playground source carries the fix itself.
    if "__prevState" not in src and PREV_STATE_ANCHOR in src:
        src = src.replace(PREV_STATE_ANCHOR, PREV_STATE_SHIM, 1)
        print("componentDidUpdate: prevState shim applied")

    for name, pattern, repl, expected in PERF_PATCHES:
        src, n = re.subn(pattern, repl, src)
        if n == 0 or (expected is not None and n != expected):
            print("perf patch %-30s SKIPPED (matched %d, expected %s) - export changed?" % (name, n, expected or ">0"))
        else:
            print("perf patch %-30s applied x%d" % (name, n))

    tag = '<script src="./support.js"></script>'
    if tag not in src:
        raise SystemExit("support.js script tag not found - did the export format change?")

    src = src.replace(tag, RESOURCES + tag, 1)
    if head_extra:
        src = src.replace("</head>", head_extra + "</head>", 1)
    return src, inlined


def patched_runtime():
    # dc-runtime maps lowercased DOM attributes back to React event props via EVENT_MAP.
    # "onpointerdowncapture" is missing there, so the fallback yields "onPointerdowncapture",
    # which React ignores: every on*Capture handler in the export silently never fires
    # (the Pill press look depends on onPointerDownCapture). Map "<event>capture" to
    # EVENT_MAP["<event>"] + "Capture".
    runtime = open(os.path.join(ROOT, "support.js"), encoding="utf-8").read()
    fallback = 'key = EVENT_MAP[key] || "on" + key[2].toUpperCase() + key.slice(3);'
    capture = ('key = EVENT_MAP[key] || (key.endsWith("capture") && EVENT_MAP[key.slice(0, -7)] '
               '? EVENT_MAP[key.slice(0, -7)] + "Capture" : "on" + key[2].toUpperCase() + key.slice(3));')
    if fallback not in runtime:
        raise SystemExit("support.js event-name fallback not found - runtime changed, re-check Capture handlers")
    print("support.js: on*Capture event mapping patched")
    return runtime.replace(fallback, capture, 1)


def main():
    src_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, DEFAULT_SRC)
    if not os.path.exists(src_path):
        raise SystemExit("missing source: " + src_path)
    print("source      : " + os.path.basename(src_path))
    src, inlined = process_page(open(src_path, encoding="utf-8").read())

    web = src.replace("</head>", SW_REGISTER + "</head>", 1)

    os.makedirs(OUT, exist_ok=True)
    open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(web)
    open(os.path.join(OUT, "support.js"), "w", encoding="utf-8").write(patched_runtime())
    for name in VENDOR:
        shutil.copy(os.path.join(ROOT, "vendor", name), os.path.join(OUT, name))
    for folder in SHIPPED_DIRS:
        dest = os.path.join(OUT, folder)
        shutil.rmtree(dest, ignore_errors=True)
        shutil.copytree(os.path.join(ROOT, folder), dest)

    print("dist-app/index.html  %.1f KB  (%d assets inlined)"
          % (len(web.encode()) / 1024, inlined))

    # Keep the Android payload in sync: the APK serves this folder through
    # WebViewAssetLoader, so it must match dist-app/ exactly.
    if os.path.isdir(os.path.dirname(ANDROID_ASSETS)):
        os.makedirs(ANDROID_ASSETS, exist_ok=True)
        payload = ["support.js", "manifest.webmanifest",
                   "icon-192.png", "icon-512.png", "app-icon.png"] + VENDOR
        for name in payload:
            shutil.copy(os.path.join(OUT, name), os.path.join(ANDROID_ASSETS, name))
        open(os.path.join(ANDROID_ASSETS, "index.html"), "w", encoding="utf-8").write(src)
        for folder in SHIPPED_DIRS:
            dest = os.path.join(ANDROID_ASSETS, folder)
            shutil.rmtree(dest, ignore_errors=True)
            shutil.copytree(os.path.join(OUT, folder), dest)
        stale = os.path.join(ANDROID_ASSETS, "sw.js")
        if os.path.exists(stale):
            os.remove(stale)
        print("android/app/src/main/assets/www  synced (%d files, no service worker)"
              % (len(payload) + 1))


if __name__ == "__main__":
    main()

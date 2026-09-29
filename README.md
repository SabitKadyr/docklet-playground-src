# Docklet Playground

An interactive prototype for testing and fine-tuning how the Docklet dock feels on a real phone.
It is not a release build of the app.

## What you can try

- Swipe up on the dock to open the app launcher.
- Long-press an app to pin it to the dock or add it to favourites.
- Tap the centre Pill to open search with a live camera.
- Hide the dock with one of four gestures: Slide, Reverse Park, Boom Gate or Pivot Turn.
- Open "Tweak Docklet" to change motion, speed, dock shape, tabs, haptics and the Pill press style live.
- Pass any export to the build to try an older version: `python3 build.py "Tabbar App.dc.html"`.

## Files

| Path | What it is |
|---|---|
| `Best of Both Worlds.dc.html` | Current prototype source, exported from Claude Design. `build.py` uses it by default |
| `Tabbar App.dc.html`, `Tabbar Improved.dc.html`, `Tabbar Improved Better.dc.html` | Earlier exports, kept for comparison |
| `support.js`, `assets/`, `vendor/` | Runtime, icons and images, bundled React 18.3.1 |
| `build.py` | Builds `dist-app/` and syncs the Android payload |
| `dist-app/` | Web build, open `index.html` over https |
| `android/` | Minimal WebView wrapper that ships the prototype inside an APK |

## Build

```bash
python3 build.py
```

```bash
bash android/make_apk.sh
```

The APK lands in `android/build/docklet-playground.apk`. The script creates a local debug signing key on
first run. See `android/README.md` for details.

## Known limitation

Opening search while the live camera runs can stutter for about 0.1 to 0.2 seconds.
The prototype runs in an Android WebView, which cannot bring up the keyboard, animate the layout and play
a live camera feed smoothly at the same time. A short blur masks it. A native build does not have this problem.

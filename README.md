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
| `BoBw Gesture Recorder.dc.html` | Gesture recorder that loads the prototype pages and records touches |
| `build_recorder.py` | Builds the recorder as a separate app, Docklet Recorder |

## Build

```bash
python3 build.py
```

```bash
bash android/make_apk.sh
```

The APK lands in `android/build/docklet-playground.apk`. The script creates a local debug signing key on
first run. See `android/README.md` for details.

## Gesture recorder

Docklet Recorder is a separate app (`com.docklet.recorder`) that installs next to the playground.
It loads any prototype page from its list, records every touch while you use it, and recognises the
gesture. Each take exports as JSON, CSV or a PNG of the traces into `Download/Docklet Recorder` on the phone.

```bash
python3 build_recorder.py
```

The APK lands in `android/build-recorder/docklet-recorder.apk`. The PNG shows the traces on a black
background: the page screenshot needs a library the recorder loads from the internet, and the app
has no network access.

## Known limitation

Opening search while the live camera runs can stutter for about 0.1 to 0.2 seconds.
The prototype runs in an Android WebView, which cannot bring up the keyboard, animate the layout and play
a live camera feed smoothly at the same time. A short blur masks it. A native build does not have this problem.

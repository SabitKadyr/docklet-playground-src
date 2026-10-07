# Docklet Playground

An interactive prototype for testing and fine-tuning how the Docklet dock feels on a real phone.
It is not a release build of the app.

## What you can try

- Swipe up on the dock to open the app launcher.
- Long-press an app to pin it to the dock or add it to favourites.
- Tap the centre Pill to open search with a live camera.
- Hide the dock with one of four gestures: Slide, Reverse Park, Drawbridge or Pivot Turn.
- Open "Tweak Docklet" to change motion, speed, dock shape, tabs, haptics and the Pill press style live.
- Pass any export to the build to try an older version: `python3 build.py "Tabbar App.dc.html"`.

What changed in each version: [CHANGELOG.md](CHANGELOG.md).

## Files

| Path | What it is |
|---|---|
| `Best of Both Worlds.dc.html` | Current prototype source, exported from Claude Design. `build.py` uses it by default |
| `Tabbar App.dc.html`, `Tabbar Improved.dc.html`, `Tabbar Improved Better.dc.html` | Earlier exports, kept for comparison |
| `support.js`, `assets/`, `vendor/` | Runtime, icons and images, bundled React 18.3.1 |
| `build.py` | Builds `dist-app/` and syncs the Android payload |
| `dist-app/` | Web build, open `index.html` over https |
| `android/` | Minimal WebView wrapper that ships the prototype inside an APK |
| `BoBw Gesture Recorder.dc.html` | Gesture recorder that loads Best of Both Worlds and records touches |
| `build_recorder.py` | Builds the recorder as a separate app, Docklet Recorder |
| `RECORDER.md` | Tester guide: how to record gestures and send the logs |
| `Docklet Liquid.dc.html`, `docklet-liquid.js`, `docklet-sprite.js`, `docklet-data.js` | Liquid search flow: the Pill flows into a search card and text input |
| `build_liquid.py` | Builds it as a separate app, Docklet Liquid |

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
It loads the Best of Both Worlds prototype and records how you use it. In Session mode (the default) one
recording covers many gestures and logs what each one changed in the prototype. In Take mode each
recording is one gesture with a snapshot and replay. Each take exports as JSON, CSV or a PNG of the traces into `Download/Docklet Recorder` on the phone.

**Testers:** step-by-step guide to recording gestures and sending logs in [RECORDER.md](RECORDER.md).

To build it:

```bash
python3 build_recorder.py
```

The APK lands in `android/build-recorder/docklet-recorder.apk`. The PNG shows the traces on a black
background: the page screenshot needs a library the recorder loads from the internet, and the app
has no network access.

## Docklet Liquid

Docklet Liquid is a separate app (`com.docklet.liquid.design`) for the Liquid search flow: tap the Pill and it flows into a search card, tap the field to type. To build it:

```bash
python3 build_liquid.py
```

The APK lands in `android/build-liquid/docklet-liquid.apk`.

It is built with `PREDICTIVE_BACK=1`, which turns on Android's Back callbacks (`android:enableOnBackInvokedCallback`). While the dock is hidden, its edge glow takes the 200 dp of the edge that Android lets an app exclude from Back, and a Back swipe below the glow, down to where the dock was, pulls the dock out (`DockletNative.setBackPull` in `MainActivity`). The playground and the recorder are built without it and keep the classic Back handling.

## Versions

Each app takes its version from `versions.json` (`"playground"`, `"recorder"` and `"liquid"`, as `major.minor.patch`).
`make_apk.sh` and the Android Studio build read it, and the versionCode is `major*10000 + minor*100 + patch`.
Bump the number there before a release. Release tags are `vX.Y` for the playground, `recorder-vX.Y` for the recorder and `liquid-vX.Y.Z` for Docklet Liquid.

## Known limitation

Opening search while the live camera runs can stutter for about 0.1 to 0.2 seconds.
The prototype runs in an Android WebView, which cannot bring up the keyboard, animate the layout and play
a live camera feed smoothly at the same time. A short blur masks it. A native build does not have this problem.

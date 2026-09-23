# Docklet — native Android app

A real Android app (Java + `WebView`) that ships the playground **inside the
APK**. No hosting, no PWABuilder, no network at runtime, no Chrome dependency.

## Build it

```
./make_apk.sh
```

Output: `build/docklet-playground.apk` — signed, aligned, installable. Takes a few seconds.

This uses only the Android SDK build-tools (`aapt2`, `d8`, `zipalign`,
`apksigner`) and the JDK bundled inside Android Studio. No Gradle, no Maven, no
network — the app has zero library dependencies, which is the whole reason this
works.

Install:

```
adb install -r build/docklet-playground.apk
```

or copy the `.apk` to the phone and tap it (allow "install unknown apps" once).

### Android Studio

Open this folder. You get Device Manager, logcat and run/debug, which the script
route doesn't give you.

The AGP version in `build.gradle.kts` is the one thing that may not match your
Studio build — if sync complains, accept the Upgrade Assistant's bump. Nothing
else needs to change, since there are no dependencies and no Kotlin. Studio may
also offer to download a matching SDK platform; let it.

Studio's output lands at `app/build/outputs/apk/release/app-release.apk`,
separate from the script's `build/docklet-playground.apk`.

## How it works

`app/src/main/assets/www/` holds the built page. `MainActivity` intercepts
requests to `https://appassets.androidplatform.net/assets/…` and serves them
straight out of those assets.

The synthetic https host is not decoration. A `file://` URL is an opaque origin
where WebView blocks `localStorage`, so the playground's preset store would
silently fail to persist. Serving over an https origin we intercept keeps it a
secure context.

There is deliberately **no service worker** in the APK payload. Everything is
already local, so a cache-first worker buys nothing — and it would keep serving
the previous `index.html` from its cache after an app update. `build.py` strips
the registration from the Android variant and keeps it only for `dist-app/`.

## Updating the content

After editing `../Docklet App.dc.html`:

```
python3 ../build.py    # rebuilds dist-app/ and syncs assets/www/
./make_apk.sh
```

`build.py` defaults to `../Tabbar App.dc.html`; pass another export as its
first argument to build from that one instead.

## Signing

`make_apk.sh` generates `debug.keystore` on first run and signs with it (v2+v3
schemes). Fine for sideloading; make a real keystore before distributing.

## React

React + ReactDOM 18.3.1 are bundled in `assets/www/`. `index.html` maps the
unpkg URLs to them via `window.__resources`, which `support.js` checks before
reaching for the CDN. The vendored copies were verified against the sha384 SRI
hashes `support.js` pins, so they're byte-identical to what the CDN serves.

The app makes no network requests at runtime.

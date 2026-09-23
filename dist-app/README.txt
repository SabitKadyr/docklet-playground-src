Docklet — hosted PWA build
Built from "Tabbar App.dc.html" by ../build.py.

For the native Android app, use ../android/ instead — it bundles this folder
into a real APK, no hosting required. These notes cover the hosted-PWA route
(add-to-home-screen, or a PWABuilder TWA).

WHAT'S IN HERE
  index.html            the app; all SVG/JPG assets inlined as data URIs
  support.js            dc-runtime (kept as a separate file on purpose, see NOTE)
  react*.min.js         React + ReactDOM 18.3.1, bundled
  manifest.webmanifest  PWA manifest
  sw.js                 service worker, cache-first
  icon-192/512, app-icon.png

STEP 1  Host this folder
  app.netlify.com/drop -> drag the folder in -> you get https://something.netlify.app
  (GitHub Pages or Vercel work the same. It must be https.)

STEP 2  Make the APK
  pwabuilder.com -> paste the URL -> Start
  Package For Stores -> Android -> Generate
  Download the zip. Inside:
    app-release-signed.apk   <- send this to the phone, tap to install
    app-release-bundle.aab   <- only needed for Google Play
    signing.keystore + key info  <- keep it, you need it for future updates

STEP 3  Install on the phone
  Send the .apk (Drive, Telegram, USB). Tap it, allow "install unknown apps" once.

NETWORK
  None at runtime. React + ReactDOM 18.3.1 ship in this folder and index.html
  maps the unpkg URLs to them through window.__resources, which support.js
  checks before falling back to the CDN. Works offline from first launch.

NOTE  why support.js is not inlined
  support.js finds the component template by regex-scanning the document text
  for "<x-dc". Its own source contains that literal string, so inlining it makes
  the scan match inside the runtime and swallow it as template markup — the page
  then renders the runtime's source as visible text. Keep it external.

REBUILD
  From the project root, after editing "Tabbar App.dc.html":
    python3 build.py

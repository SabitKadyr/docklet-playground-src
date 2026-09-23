#!/bin/bash
# Build a signed, installable APK using only the Android SDK build-tools and a
# JDK. No Gradle, no Maven, no network - the app has zero library dependencies.
#
# Android Studio can build this project too (see README.md); this script exists
# so the APK can be produced from a terminal without a Gradle sync.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SDK="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
JAVA_HOME="${JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}"
# d8/apksigner are shell wrappers that invoke `java`; without this they find
# macOS's stub at /usr/bin/java and bail with "Unable to locate a Java Runtime".
export JAVA_HOME
export PATH="$JAVA_HOME/bin:$PATH"

# Pick the newest installed build-tools and platform.
BT="$(ls -1d "$SDK"/build-tools/*/ 2>/dev/null | sort -V | tail -1)"
PLATFORM="$(ls -1d "$SDK"/platforms/*/ 2>/dev/null | sort -V | tail -1)"
[ -n "$BT" ] || { echo "no build-tools in $SDK" >&2; exit 1; }
[ -n "$PLATFORM" ] || { echo "no platform in $SDK" >&2; exit 1; }
ANDROID_JAR="$PLATFORM/android.jar"

SRC="$HERE/app/src/main"
OUT="$HERE/build"
KEYSTORE="$HERE/debug.keystore"
APK="$OUT/docklet-playground.apk"

echo "build-tools : $BT"
echo "platform    : $PLATFORM"
echo "jdk         : $("$JAVA_HOME/bin/java" -version 2>&1 | head -1)"

rm -rf "$OUT"
mkdir -p "$OUT/res" "$OUT/classes" "$OUT/dex" "$OUT/gen"

# 0. aapt2 needs package= in the manifest; AGP 8 forbids it there and takes the
#    value from `namespace` instead. Inject it into a throwaway copy so both
#    build paths work off the same source manifest.
PKG="$(sed -n 's/.*namespace *= *"\([^"]*\)".*/\1/p' "$HERE/app/build.gradle.kts")"
[ -n "$PKG" ] || { echo "could not read namespace from app/build.gradle.kts" >&2; exit 1; }
echo "package     : $PKG"
sed "s|<manifest |<manifest package=\"$PKG\" |" \
  "$SRC/AndroidManifest.xml" > "$OUT/AndroidManifest.xml"

# 1. compile resources
"$BT/aapt2" compile --dir "$SRC/res" -o "$OUT/res/compiled.zip"

# 2. link -> base APK with resources + manifest, and generate R.java
"$BT/aapt2" link \
  -o "$OUT/base.apk" \
  -I "$ANDROID_JAR" \
  --manifest "$OUT/AndroidManifest.xml" \
  --java "$OUT/gen" \
  --min-sdk-version 24 \
  --target-sdk-version 34 \
  "$OUT/res/compiled.zip"

# 3. compile java (framework-only classpath).
#    Sources go through an argfile: the project path may contain spaces, which
#    an unquoted $(find ...) would split into bogus flags.
find "$SRC/java" "$OUT/gen" -name '*.java' -print0 \
  | xargs -0 -I{} printf '"%s"\n' "{}" > "$OUT/sources.txt"
#    --release (not -source/-target + -bootclasspath, which JDK 25 rejects)
#    pins the java.* API level; android.jar on the classpath supplies android.*.
"$JAVA_HOME/bin/javac" \
  --release 11 -nowarn \
  -classpath "$ANDROID_JAR" \
  -d "$OUT/classes" \
  "@$OUT/sources.txt"

# 4. dex. Jar the classes first so d8 takes a single quotable path.
(cd "$OUT/classes" && "$JAVA_HOME/bin/jar" cf "$OUT/classes.jar" .)
"$BT/d8" --min-api 24 --output "$OUT/dex" \
  --lib "$ANDROID_JAR" \
  "$OUT/classes.jar"

# 5. add classes.dex and assets into the APK
cp "$OUT/base.apk" "$OUT/unsigned.apk"
(cd "$OUT/dex" && "$JAVA_HOME/bin/jar" uf "$OUT/unsigned.apk" classes.dex)
(cd "$SRC" && "$JAVA_HOME/bin/jar" uf "$OUT/unsigned.apk" assets)

# 6. align
"$BT/zipalign" -p -f 4 "$OUT/unsigned.apk" "$OUT/aligned.apk"

# 7. sign (self-signed debug key, generated once)
if [ ! -f "$KEYSTORE" ]; then
  echo "generating debug keystore"
  "$JAVA_HOME/bin/keytool" -genkeypair -v \
    -keystore "$KEYSTORE" -storepass android -keypass android \
    -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=Android Debug,O=Android,C=US" >/dev/null
fi

"$BT/apksigner" sign \
  --ks "$KEYSTORE" --ks-pass pass:android --key-pass pass:android \
  --ks-key-alias androiddebugkey \
  --out "$APK" "$OUT/aligned.apk"

"$BT/apksigner" verify --print-certs "$APK" >/dev/null
rm -f "$OUT/base.apk" "$OUT/unsigned.apk" "$OUT/aligned.apk" "$APK.idsig" "$OUT/classes.jar" "$OUT/sources.txt"

echo
echo "APK: $APK"
ls -lh "$APK" | awk '{print "size:", $5}'

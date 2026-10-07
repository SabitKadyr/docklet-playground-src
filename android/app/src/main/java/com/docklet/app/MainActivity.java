package com.docklet.app;

import android.Manifest;
import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Rect;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import android.window.BackEvent;
import android.window.OnBackAnimationCallback;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.HashMap;
import java.util.Map;

/**
 * Hosts the Docklet playground in a full-screen WebView.
 *
 * The payload lives in assets/www and is served over a synthetic https origin
 * rather than a file:// URL. That matters: file:// is an opaque origin, where
 * WebView blocks localStorage, so the playground's preset store would silently
 * fail to persist. Intercepting an https host keeps it a secure origin.
 *
 * Deliberately depends on nothing outside the framework, so the project builds
 * with just the Android SDK build-tools - no Gradle, Maven or AndroidX needed.
 */
public class MainActivity extends Activity {

    /** Same host AndroidX's WebViewAssetLoader uses; it resolves to nothing public. */
    private static final String APP_HOST = "appassets.androidplatform.net";
    private static final String ASSET_PREFIX = "/assets/";
    private static final String ASSET_ROOT = "www";
    private static final String START_URL =
            "https://" + APP_HOST + ASSET_PREFIX + "index.html";

    private static final Map<String, String> MIME_TYPES = buildMimeTypes();

    private static final int REQ_CAMERA = 1;

    private WebView webView;
    /** getUserMedia call parked while the Android camera permission dialog is up. */
    private PermissionRequest pendingCameraRequest;
    /** Predictive Back pull of a hidden dock (API 34+), see setBackPull. Null until first used. */
    private Object backPull;

    private static Map<String, String> buildMimeTypes() {
        Map<String, String> m = new HashMap<>();
        m.put("html", "text/html");
        m.put("js", "application/javascript");
        m.put("css", "text/css");
        m.put("json", "application/json");
        m.put("webmanifest", "application/manifest+json");
        m.put("svg", "image/svg+xml");
        m.put("png", "image/png");
        m.put("jpg", "image/jpeg");
        m.put("jpeg", "image/jpeg");
        m.put("webp", "image/webp");
        m.put("woff2", "font/woff2");
        return Collections.unmodifiableMap(m);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        goEdgeToEdge();

        // Lets chrome://inspect and the webview atrace category see this page; the playground is a dev build.
        WebView.setWebContentsDebuggingEnabled(true);
        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#0b0c0f"));
        webView.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        // Everything ships inside the APK; nothing should reach the filesystem.
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(
                    WebView view, WebResourceRequest request) {
                return serveAsset(request.getUrl());
            }
        });

        // getUserMedia from the page lands here. Only the camera, only for our
        // own origin; everything else is refused.
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                handleWebPermission(request);
            }
        });

        // WebView ignores <a download href="blob:...">, and navigator.share is missing, so a page
        // that exports files (the gesture recorder) hands them to DockletNative.save instead; the
        // build injects the shim that routes blob downloads here.
        webView.addJavascriptInterface(new NativeBridge(), "DockletNative");

        setContentView(webView);
        installBackCallback();

        if (savedInstanceState == null) {
            webView.loadUrl(START_URL);
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    /**
     * Bridges the page's getUserMedia({video}) to the Android CAMERA permission.
     * WebView only grants what the app itself holds, so a first call triggers
     * the system dialog and the web request is answered from its result.
     */
    private void handleWebPermission(PermissionRequest request) {
        Uri origin = request.getOrigin();
        boolean ours = origin != null && APP_HOST.equals(origin.getHost());
        boolean wantsCamera = false;
        for (String r : request.getResources()) {
            if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(r)) {
                wantsCamera = true;
            }
        }
        if (!ours || !wantsCamera) {
            request.deny();
            return;
        }
        if (checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            request.grant(new String[] { PermissionRequest.RESOURCE_VIDEO_CAPTURE });
            return;
        }
        if (pendingCameraRequest != null) {
            pendingCameraRequest.deny();
        }
        pendingCameraRequest = request;
        requestPermissions(new String[] { Manifest.permission.CAMERA }, REQ_CAMERA);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(requestCode, permissions, results);
        if (requestCode != REQ_CAMERA || pendingCameraRequest == null) {
            return;
        }
        PermissionRequest req = pendingCameraRequest;
        pendingCameraRequest = null;
        if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) {
            req.grant(new String[] { PermissionRequest.RESOURCE_VIDEO_CAPTURE });
        } else {
            req.deny();
        }
    }

    /**
     * Maps https://appassets.androidplatform.net/assets/<path> onto assets/www/<path>.
     * Returns null for anything else, which lets WebView handle it normally.
     */
    private WebResourceResponse serveAsset(Uri uri) {
        if (!APP_HOST.equals(uri.getHost())) {
            return null;
        }
        String path = uri.getPath();
        if (path == null || !path.startsWith(ASSET_PREFIX)) {
            return null;
        }

        String rel = path.substring(ASSET_PREFIX.length());
        if (rel.isEmpty()) {
            rel = "index.html";
        }
        // Refuse traversal out of the asset root.
        if (rel.contains("..")) {
            return null;
        }

        try {
            InputStream in = getAssets().open(ASSET_ROOT + "/" + rel);
            return new WebResourceResponse(mimeTypeOf(rel), "utf-8", in);
        } catch (IOException e) {
            return null;
        }
    }

    private static String mimeTypeOf(String path) {
        int dot = path.lastIndexOf('.');
        if (dot < 0) {
            return "application/octet-stream";
        }
        String ext = path.substring(dot + 1).toLowerCase();
        String mime = MIME_TYPES.get(ext);
        return mime != null ? mime : "application/octet-stream";
    }

    /** Page-to-app calls. Every method runs on a WebView background thread. */
    private final class NativeBridge {
        /**
         * The page reports where the dock can be dragged, as a JSON array of {x, y, w, h} in CSS
         * px of the viewport. The system Back gesture is switched off inside those rects, so an
         * edge swipe there reaches the dock. Android honours at most 200 dp per screen edge,
         * counted from the bottom, which covers the dock.
         */
        @JavascriptInterface
        public void setGestureZones(String json) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                return;
            }
            final List<Rect> rects = new ArrayList<>();
            try {
                float d = getResources().getDisplayMetrics().density;
                JSONArray a = new JSONArray(json == null ? "[]" : json);
                for (int i = 0; i < a.length() && i < 8; i++) {
                    JSONObject o = a.getJSONObject(i);
                    int x = Math.round((float) o.getDouble("x") * d);
                    int y = Math.round((float) o.getDouble("y") * d);
                    int w = Math.round((float) o.getDouble("w") * d);
                    int h = Math.round((float) o.getDouble("h") * d);
                    if (w > 0 && h > 0) {
                        rects.add(new Rect(x, y, x + w, y + h));
                    }
                }
            } catch (JSONException e) {
                return;
            }
            runOnUiThread(() -> {
                if (webView != null) {
                    webView.setSystemGestureExclusionRects(rects);
                }
            });
        }

        /**
         * The page reports whether the dock is hidden, as JSON {on, side: "left"|"right", top, bottom} in CSS px:
         * the edge it hides to and the height of its edge glow. While on, a system Back swipe that starts at that
         * edge within that height is handed to the page (window.__dockletBack) to pull the dock out with the
         * finger; any other Back stays a normal Back. Above the bottom 200 dp the system owns edge swipes, so this
         * is the only way to pull the upper part of the glow. Needs android:enableOnBackInvokedCallback, which
         * make_apk.sh sets when PREDICTIVE_BACK=1; without it Android ignores the callback.
         */
        @JavascriptInterface
        public void setBackPull(String json) {
            if (Build.VERSION.SDK_INT < 34) {
                return;
            }
            final boolean on;
            final String side;
            final float top, bottom;
            try {
                JSONObject o = new JSONObject(json == null ? "{}" : json);
                on = o.optBoolean("on", false);
                side = o.optString("side", "right");
                top = (float) o.optDouble("top", 0);
                bottom = (float) o.optDouble("bottom", 0);
            } catch (JSONException e) {
                return;
            }
            runOnUiThread(() -> {
                if (backPull == null) {
                    backPull = new BackPull();
                }
                ((BackPull) backPull).set(on, side, top, bottom);
            });
        }

        @JavascriptInterface
        public boolean save(String name, String mime, String base64) {
            String safe = name == null ? "" : name.replaceAll("[\\\\/:*?\"<>|]", "_").trim();
            if (safe.isEmpty()) {
                safe = "export";
            }
            String type = mime == null || mime.isEmpty() ? "application/octet-stream" : mime;
            String folder = getApplicationInfo().loadLabel(getPackageManager()).toString();
            try {
                byte[] data = Base64.decode(base64, Base64.DEFAULT);
                String where = writeDownload(folder, safe, type, data);
                toast("Saved " + safe + " to " + where);
                return true;
            } catch (Exception e) {
                toast("Could not save " + safe + ": " + e.getMessage());
                return false;
            }
        }
    }

    /**
     * Downloads/<app label>/<name>. API 29+ goes through MediaStore and needs no permission;
     * older releases fall back to the app's own external files dir, also permission-free.
     */
    private String writeDownload(String folder, String name, String mime, byte[] data) throws IOException {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentResolver cr = getContentResolver();
            ContentValues v = new ContentValues();
            v.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
            v.put(MediaStore.MediaColumns.MIME_TYPE, mime);
            v.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/" + folder);
            Uri uri = cr.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
            if (uri == null) {
                throw new IOException("MediaStore refused the file");
            }
            try (OutputStream out = cr.openOutputStream(uri)) {
                if (out == null) {
                    throw new IOException("no output stream");
                }
                out.write(data);
            }
            return "Downloads/" + folder;
        }
        File dir = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), folder);
        if (!dir.isDirectory() && !dir.mkdirs()) {
            throw new IOException("cannot create " + dir);
        }
        File f = new File(dir, name);
        try (OutputStream out = new FileOutputStream(f)) {
            out.write(data);
        }
        return dir.getAbsolutePath();
    }

    private void toast(final String text) {
        runOnUiThread(() -> Toast.makeText(this, text, Toast.LENGTH_SHORT).show());
    }

    /** Draw behind the system bars - the design already reserves room for them. */
    private void goEdgeToEdge() {
        Window w = getWindow();
        w.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        w.setStatusBarColor(Color.TRANSPARENT);
        w.setNavigationBarColor(Color.TRANSPARENT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            w.setDecorFitsSystemWindows(false);
        } else {
            w.getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        }
    }

    /**
     * With android:enableOnBackInvokedCallback the system no longer calls onBackPressed; this routes Back to the
     * same handling. Without the flag Android ignores the callback and onBackPressed runs as before.
     */
    private void installBackCallback() {
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT, (OnBackInvokedCallback) this::onBackPressed);
        }
    }

    /** Hands a Back swipe from the hidden dock's edge glow to the page; see NativeBridge.setBackPull. */
    private final class BackPull implements OnBackAnimationCallback {
        private boolean registered, claimed, pendingOff, otherEdge;
        private String side = "right";
        private float top, bottom;

        void set(boolean on, String side, float top, float bottom) {
            this.side = side;
            this.top = top;
            this.bottom = bottom;
            if (on && !registered) {
                getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                        OnBackInvokedDispatcher.PRIORITY_OVERLAY, this);
                registered = true;
                pendingOff = false;
            } else if (!on && registered) {
                if (claimed) {
                    pendingOff = true;
                } else {
                    unregister();
                }
            }
        }

        private void unregister() {
            getOnBackInvokedDispatcher().unregisterOnBackInvokedCallback(this);
            registered = false;
            pendingOff = false;
        }

        private void page(String type, float x) {
            if (webView != null) {
                webView.evaluateJavascript("window.__dockletBack&&window.__dockletBack('" + type + "'," + x + ")", null);
            }
        }

        @Override
        public void onBackStarted(BackEvent e) {
            float d = getResources().getDisplayMetrics().density, y = e.getTouchY() / d;
            // the Back key also starts a back event, with no edge (EDGE_NONE on API 35+): neither edge then
            int se = e.getSwipeEdge();
            String edge = se == BackEvent.EDGE_RIGHT ? "right" : se == BackEvent.EDGE_LEFT ? "left" : "";
            claimed = edge.equals(side) && y >= top - 24 && y <= bottom + 24;
            otherEdge = !edge.isEmpty() && !edge.equals(side);
            if (claimed) {
                page("start", e.getTouchX() / d);
            }
        }

        @Override
        public void onBackProgressed(BackEvent e) {
            if (claimed) {
                page("move", e.getTouchX() / getResources().getDisplayMetrics().density);
            }
        }

        @Override
        public void onBackInvoked() {
            if (!claimed) {
                // a Back swipe from the other edge is a plain Back: the page must not bring the dock back for it
                if (otherEdge) {
                    page("plain", 0);
                }
                otherEdge = false;
                onBackPressed();
                return;
            }
            claimed = false;
            page("commit", 0);
            if (pendingOff) {
                unregister();
            }
        }

        @Override
        public void onBackCancelled() {
            otherEdge = false;
            if (!claimed) {
                return;
            }
            claimed = false;
            page("cancel", 0);
            if (pendingOff) {
                unregister();
            }
        }
    }

    /**
     * Back never closes the app: the page decides what it closes (menu, search, launcher, ...).
     * Real history entries are walked with goBack(). Chromium skips entries a page pushed without
     * a user gesture (the page's load-time "guard" entry), so canGoBack() can be false while the
     * page still wants Back; then a popstate is dispatched to it directly. Home still leaves.
     */
    @Override
    public void onBackPressed() {
        if (webView == null) {
            super.onBackPressed();
        } else if (webView.canGoBack()) {
            webView.goBack();
        } else {
            // Every frame, so the recorder's embedded prototype gets it too.
            webView.evaluateJavascript(
                    "[window].concat(Array.prototype.slice.call(window.frames)).forEach(function (w) {"
                            + " try { w.dispatchEvent(new w.PopStateEvent('popstate', { state: w.history.state })); }"
                            + " catch (e) {} })", null);
        }
    }

    @Override
    protected void onPause() {
        if (webView != null) {
            webView.onPause();
        }
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}

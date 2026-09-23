package com.docklet.app;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
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

        setContentView(webView);

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

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
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

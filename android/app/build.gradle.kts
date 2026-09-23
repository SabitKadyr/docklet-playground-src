plugins {
    id("com.android.application")
}

android {
    namespace = "com.docklet.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.docklet.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            // Debug key, so `assembleRelease` yields something sideloadable
            // with no extra setup. Swap in a real keystore before distributing.
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}

// No dependencies on purpose. The activity uses only framework APIs, which is
// what lets make_apk.sh build the same APK without Gradle or a Maven fetch.
dependencies {
}

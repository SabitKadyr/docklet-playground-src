plugins {
    id("com.android.application")
}

// Same source of truth as make_apk.sh: ../versions.json, versionCode = major*10000 + minor*100 + patch.
val appVersion: String = Regex("\"playground\"\\s*:\\s*\"([0-9.]+)\"")
    .find(rootProject.file("../versions.json").readText())!!.groupValues[1]
val appVersionCode: Int = appVersion.split(".").map { it.toInt() }
    .let { (major, minor, patch) -> major * 10000 + minor * 100 + patch }

android {
    namespace = "com.docklet.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.docklet.app"
        minSdk = 24
        targetSdk = 34
        versionCode = appVersionCode
        versionName = appVersion
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

// The AGP version is the one thing here that depends on your Android Studio
// build. If sync complains it is too old/new, let Studio's Upgrade Assistant
// bump it - nothing else in this project needs to change, because the app has
// no library dependencies and no Kotlin.
plugins {
    id("com.android.application") version "8.13.2" apply false
}

---
draft: true
sidebar_position: 2
title: Mobile Build Instructions
description: Building Android and iOS apps locally
---

# Mobile Build Instructions

This guide covers building LoRACK Android and iOS apps locally.

## Prerequisites

### Android
1. **Android Studio** with Android SDK installed
2. **JDK 17** (required for React Native 0.81.5)
3. **Environment Variables** (add to `~/.zshrc` or `~/.bash_profile`):
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
   ```

### iOS
1. **macOS** with Xcode installed
2. **CocoaPods** (`pod` available in PATH)
3. **Xcode Command Line Tools** (`xcode-select --install` if needed)

## Helper Scripts (Recommended)

```bash
# Android: fast local debug build (JDK 17 + Gradle)
./scripts/build-android-debug-local.sh

# Android: local preview build via EAS (JDK 17 + CMake pre-step)
./scripts/build-android-preview-local.sh

# iOS: local debug build via Expo
./scripts/build-ios-debug-local.sh

# iOS: local preview build via EAS
./scripts/build-ios-preview-local.sh
```

## Android Builds (Manual)

### Development Build (Debug)
```bash
# From project root
npm run android

# Or from android directory
cd android
./gradlew assembleDebug
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Production Build (Release APK)
```bash
cd android
./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

### Production Bundle (for Google Play)
```bash
cd android
./gradlew bundleRelease
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Clean Build
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

## iOS Builds (Manual)

### Development Build (Debug)
```bash
npx expo run:ios
```

### Preview Build (EAS Local)
```bash
cd ios
pod install
cd ..
eas build --platform ios --profile preview --local
```

### Clean Build
```bash
rm -rf ios/Pods ios/build
cd ios
pod install
```

## Release Signing Configuration (Android)

Release builds use the keystore and credentials configured through environment
variables. EAS supplies these values for managed builds. For a direct local Gradle
build, configure:

```bash
export ANDROID_KEYSTORE_PATH=/absolute/path/to/keystore.jks
export ANDROID_KEYSTORE_PASSWORD='...'
export ANDROID_KEY_PASSWORD='...' # Optional; defaults to the store password
export ANDROID_KEY_ALIAS='...'    # Optional; defaults to the production alias
```

If `ANDROID_KEYSTORE_PATH` is unset, Gradle looks for
`credentials/android/keystore.jks`. The `credentials/` directory is gitignored.

⚠️ **IMPORTANT**: Never commit the keystore or its passwords.

### Backup Your Keystore

⚠️ **CRITICAL**: Store a secure backup of your keystore file. If you lose it, you cannot update your app on Google Play.

Recommended backup locations:
- Secure password manager
- Encrypted cloud storage
- Hardware security key

## Installing APK on Device (Android)

### Via USB (ADB)
```bash
# Enable USB debugging on your Android device
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Via File Transfer
1. Copy APK to device
2. Open APK on device
3. Allow installation from unknown sources if prompted

## Troubleshooting

### Android: Build Fails with "Keystore not found"
Set `ANDROID_KEYSTORE_PATH` to an existing keystore, or provision
`credentials/android/keystore.jks`. This error occurs during release packaging;
if the native tasks completed first, it does not indicate a native compilation
failure.

### Android: Worklets Native Link Errors

LoRACK uses `react-native-worklets` `0.7.4` with Reanimated and Expo Modules
Core. These consumers expect `libworklets.so` in an older Android Gradle Plugin
output path. The postinstall script
`scripts/patch-worklets-native-build.js` adds debug and release synchronization
tasks that copy each ABI's library into the expected compatibility path.

The patch deliberately:

- waits for every per-ABI Worklets CMake linker task;
- removes an existing compatibility library before copying, because AGP may
  hard-link native outputs and overwriting a hard link can truncate the source;
- rejects zero-byte source libraries and incomplete copies; and
- wires Reanimated and Expo Modules Core native builds to the synchronization
  task.

The script runs automatically through `npm install`. If `node_modules` was
restored without lifecycle scripts, apply it manually:

```bash
node scripts/patch-worklets-native-build.js
```

Do not remove this postinstall patch without first verifying clean and repeated
debug and release native builds for all four Android ABIs.

### Android: Build Fails with JDK Version Error
Make sure you're using JDK 17:
```bash
java -version  # Should show version 17
```

### Android: Gradle Daemon Issues
```bash
cd android
./gradlew --stop
./gradlew clean
```

### Android: Clear Build Cache
```bash
cd android
./gradlew clean
rm -rf .gradle build app/build
./gradlew assembleRelease
```

### iOS: CocoaPods Issues
```bash
cd ios
pod install --repo-update
```

### iOS: Xcode License
```bash
sudo xcodebuild -license accept
```

## Version Management

Update version in two places:
1. `package.json`: `"version": "0.1.0"`
2. `android/app/build.gradle`:
   ```gradle
   versionCode 1        // Integer - increment for each release
   versionName "0.1.0"  // String - semantic version
   ```

**Important**: Google Play requires `versionCode` to increase with each upload.

## Build Variants (Android)

- **Debug**: Development build with debugging enabled, signed with debug keystore
- **Release**: Production build with minification, obfuscation (ProGuard), and release signing

## Additional Resources

- [React Native Android Build Documentation](https://reactnative.dev/docs/signed-apk-android)
- [Android Studio Download](https://developer.android.com/studio)
- [Gradle Build Configuration](https://developer.android.com/studio/build)

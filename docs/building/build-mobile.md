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

Release builds are automatically signed using the keystore configured in `android/gradle.properties`.

### Keystore Details
- **File**: `android/app/lorack-release-key.keystore`
- **Alias**: `lorack-key-alias`
- **Type**: PKCS12
- **Validity**: 10,000 days (~27 years)

⚠️ **IMPORTANT**: The keystore file and `gradle.properties` contain sensitive credentials and are gitignored. Never commit these files.

### Updating Keystore Password

Edit `android/gradle.properties` (this file is gitignored):
```properties
LORACK_RELEASE_STORE_FILE=lorack-release-key.keystore
LORACK_RELEASE_KEY_ALIAS=lorack-key-alias
LORACK_RELEASE_STORE_PASSWORD=your_password_here
LORACK_RELEASE_KEY_PASSWORD=your_password_here
```

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
Ensure `android/app/lorack-release-key.keystore` exists and `gradle.properties` is configured correctly.

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

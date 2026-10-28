# 📱 Expense Tracker (React Native & Expo Go)

This folder contains the complete, ready-to-run **React Native (Expo)** version of the Expense Tracker application.

---

## 🚀 How to Run in Expo Go

### 1. Copy Files to Your Repository / Folder
You can either use the `expo/` folder directly or copy its contents into your React Native repository root:

- `App.tsx`
- `app.json`
- `package.json`
- `src/`
  - `components/`
  - `constants/`
  - `hooks/`
  - `types/`
  - `utils/`

---

### 2. Install Dependencies

Open a terminal inside the project directory and run:

```bash
npx expo install @react-native-async-storage/async-storage lucide-react-native react-native-svg react-native-safe-area-context
```

Or with npm:

```bash
npm install
```

---

### 3. Start the Expo Development Server

```bash
npx expo start
```

---

### 4. Scan with Expo Go App

1. Open **Expo Go** on your iOS or Android phone:
   - **Android**: Scan the QR code in the terminal.
   - **iOS**: Scan using the native Camera app and tap the Expo banner.
2. The application will bundle and open directly on your mobile device!

---

## 🤖 How to Build Android Release with Gradle (`./gradlew assembleRelease`)

Spendly is pre-configured with modern Expo and Android Gradle configurations (`buildFeatures.buildConfig = true`, resource packaging collision prevention, Kotlin 2.1+, and fallback signing).

### 1. Prebuild the Native Android Project
Inside the `expo/` folder, run:
```bash
npx expo prebuild --platform android
```
This generates the native `android/` directory configured with Gradle, AndroidManifest with Google Mobile Ads, and native dependencies.

### 2. Run the Gradle Release Build
Navigate to the `android/` directory and execute:
```bash
# On Linux / macOS:
cd android && ./gradlew assembleRelease

# On Windows (PowerShell / Command Prompt):
cd android
.\gradlew.bat assembleRelease
```

### 3. Release APK Output Location
Once the Gradle build finishes successfully, your production APK is located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

### 4. Generating Google Play Bundle (AAB)
To generate an Android App Bundle for Google Play Store upload:
```bash
cd android && ./gradlew bundleRelease
```
The resulting bundle is output to:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### 💡 Release Build Configuration Included
- **`buildConfig = true`**: Injected into `buildFeatures` via `withAndroidBuildConfig.js` so AGP 8+ generates the necessary `BuildConfig` classes.
- **Packaging Exclusions**: Pre-configured to prevent duplicate `META-INF` file collisions (`INDEX.LIST`, `DEPENDENCIES`, etc.) commonly encountered during Gradle release assembly.
- **AndroidX Compatibility Fix (`checkReleaseAarMetadata`)**: Includes resolution strategy in Gradle forcing `androidx.core:core:1.15.0` and `androidx.activity:activity:1.9.3` so dependencies requiring Android API 36 compile smoothly with standard `compileSdk 35`.
- **AdMob Integration**: Android Ad ID permission (`com.google.android.gms.permission.AD_ID`) and App ID metadata are wired up to comply with Google Play policies.
- **Signing Fallback**: Fallback to debug signature is enabled by default so `./gradlew assembleRelease` runs and completes immediately without throwing missing keystore exceptions.

---

## 📂 Architecture Overview

- **`src/types/index.ts`**: Unified TypeScript contracts for Transactions, Accounts, Budgets, and Goals.
- **`src/constants/theme.ts`**: Dark luxury design tokens, category colors, and initial seed accounts.
- **`src/utils/storage.ts`**: Async persistent device storage using `@react-native-async-storage/async-storage`.
- **`src/hooks/useExpenseData.ts`**: Centralized reactive state management & financial calculations.
- **`src/components/`**: Modular React Native UI components built with `<View>`, `<Text>`, `<TouchableOpacity>`, `<ScrollView>`, and `<Modal>`.

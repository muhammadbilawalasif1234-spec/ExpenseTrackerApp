<<<<<<< HEAD
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
=======
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

## 📂 Architecture Overview

- **`src/types/index.ts`**: Unified TypeScript contracts for Transactions, Accounts, Budgets, and Goals.
- **`src/constants/theme.ts`**: Dark luxury design tokens, category colors, and initial seed accounts.
- **`src/utils/storage.ts`**: Async persistent device storage using `@react-native-async-storage/async-storage`.
- **`src/hooks/useExpenseData.ts`**: Centralized reactive state management & financial calculations.
- **`src/components/`**: Modular React Native UI components built with `<View>`, `<Text>`, `<TouchableOpacity>`, `<ScrollView>`, and `<Modal>`.
>>>>>>> fff51e5 (Initial commit)

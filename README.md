# M-Hike Frontend (Expo + React Native)

The **M-Hike Frontend** is a cross-platform mobile hiking companion application built with **Expo**, **React Native**, and **React Navigation**. It provides an intuitive interface for managing hikes, observations, images, and GPS location while connecting to the M-Hike backend API.

---

## 🚀 Features

- Cross-platform support: **Android**, **iOS**, **Web**
- Authentication using SecureStore
- Create, edit, delete hikes
- Add observations with image uploads
- GPS location using Expo Location
- Interactive maps using `react-native-maps`
- Bottom tab navigation + Expo Router v6
- Modern styling using **NativeWind (TailwindCSS)**
- API integration with Axios

---

## 📦 Tech Stack

### Core

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript

### UI & Navigation

- Expo Router
- React Navigation
- NativeWind / TailwindCSS
- Expo Vector Icons

### Device & System APIs

- Expo Image Picker
- Expo Image Manipulator
- Expo FileSystem
- Expo Secure Store
- Expo Location
- Expo Haptics

---

## 📁 Project Structure

m-hike-frontend/
├── app/ # Screens & navigation (Expo Router)
├── components/ # UI components
├── hooks/ # Custom hooks
├── assets/ # Images, fonts, icons
├── scripts/ # Utility scripts
├── package.json
├── tailwind.config.js
└── tsconfig.json

---

# 🛠️ How to Install & Run the M-Hike Frontend

Follow these steps to teach others how to run the project.

---

## 1️⃣ Install Required Software

Before running the app, install:

- **Node.js** (v18 or newer)
- **Expo CLI** (global)
- **Android Studio** or **Xcode** (optional for emulators)

Install Expo CLI:

```sh
npm install -g expo

```

Download the Project (Clone from GitHub)
git clone https://github.com/<your-username>/<your-repository>.git
cd m-hike-frontend

Replace <your-username> and <your-repository> with your GitHub repo name.

3️⃣ Install Dependencies
npm install

(You may also use yarn install)

4️⃣ Run the App
Start Expo Development Server
npm start

This opens the Expo Developer Tools in your browser.

Run on Android
npm run android

Requires Android Emulator OR a real Android device with Expo Go installed.

Run on iOS (macOS only)
npm run ios

Requires Xcode + iOS Simulator.

Run on Web
npm run web

🔧 Optional: Environment Variables

Create a .env file in the project root:

API_URL=https://your-backend-url/api

You can load it using your preferred method (e.g., expo-constants, react-native-dotenv).

🧪 Linting & Code Quality

Run ESLint check:

npm run lint

🐞 Common Issues & Fixes
❌ Metro bundler stuck
npx expo start -c

❌ Android emulator not detected

Open Android Studio → Device Manager → Start emulator

Then run:

npm run android

❌ iOS build errors (Mac)

Install CocoaPods:

sudo gem install cocoapods

Then:

npx pod-install

🤝 Contributing

Fork the repository

Create a new branch

Commit changes

Open a Pull Request

Contributions are welcome!

📄 License

This project is for educational use and not intended for commercial deployment.

---

If you want, I can now generate the **backend Android Java README.md** in the exact same style so

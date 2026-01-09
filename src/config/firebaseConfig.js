// src/config/firebaseConfig.js
// PRODUCTION NOTE: This file requires your 'google-services.json' (Android) 
// or 'GoogleService-Info.plist' (iOS) to be placed in the project root.

// For JS-SDK usage (Web fallback):
export const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "campusflow-PROJECT.firebaseapp.com",
    projectId: "campusflow-PROJECT",
    storageBucket: "campusflow-PROJECT.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};

// Note: @react-native-firebase/* libraries use native config (google-services.json) automatically.
// They do NOT require this JS config object for native Android/iOS builds.

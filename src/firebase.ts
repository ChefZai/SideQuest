import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, initializeFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDwer-P7co_UNK-MkwyI24Ih8da7I1eB38",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sidequest-2e798.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sidequest-2e798",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sidequest-2e798.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1052439866179",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1052439866179:web:f0af3e29b8ca572f67ddf6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true
});
export const storage = getStorage(app);

if (import.meta.env.VITE_QA_EMULATORS === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8085);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}

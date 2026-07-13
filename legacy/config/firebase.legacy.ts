import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDwer-P7co_UNK-MkwyI24Ih8da7I1eB38",
  authDomain: "sidequest-2e798.firebaseapp.com",
  projectId: "sidequest-2e798",
  storageBucket: "sidequest-2e798.firebasestorage.app",
  messagingSenderId: "1052439866179",
  appId: "1:1052439866179:web:f0af3e29b8ca572f67ddf6",
  measurementId: "G-SHEMBJC6G6",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
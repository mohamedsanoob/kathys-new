// firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAlu_3mtUtofrX1TsxemgUs1r6-gEf_j_Q",
  authDomain: "resmenu-c1b90.firebaseapp.com",
  projectId: "resmenu-c1b90",
  storageBucket: "resmenu-c1b90.appspot.com",
  messagingSenderId: "142367069819",
  appId: "1:142367069819:web:f1c79ebd5b924b98f2f4de",
  measurementId: "G-C55G2NCHYR",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

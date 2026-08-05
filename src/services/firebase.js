import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAlh41094phxhm6NZDyzKFENmivi5ceRuI",
  authDomain: "ratemyprofe-fea08.firebaseapp.com",
  projectId: "ratemyprofe-fea08",
  storageBucket: "ratemyprofe-fea08.firebasebasestorage.app",
  messagingSenderId: "103032053506",
  appId: "1:103032053506:web:74f887daba6bc94a6fac1b"
};

const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);

export const COL_RESENAS = "resenas";

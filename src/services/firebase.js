import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') console.warn('Persistence failed: Multiple tabs open');
  else if (err.code === 'unimplemented') console.warn('Persistence not supported by browser');
});
export const auth = getAuth(firebaseApp);

// Initialize App Check if SITE_KEY is configured
if (import.meta.env.VITE_APP_CHECK_SITE_KEY) {
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_APP_CHECK_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
} else {
  console.warn("Firebase App Check NO está activado. Añade VITE_APP_CHECK_SITE_KEY en tu .env");
}

export const COL_RESENAS = "resenas";

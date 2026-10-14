import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import firebaseConfigJson from '../../firebase-applet-config.json' with { type: 'json' };

// Firebase configuration from user and provisioned project
export const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey || "AIzaSyDpDoJ6oX0N4MJnk5gVxkzhr0VUSRoGrzI",
  authDomain: firebaseConfigJson.authDomain || "apna-shoes9540.firebaseapp.com",
  projectId: firebaseConfigJson.projectId || "apna-shoes9540",
  storageBucket: firebaseConfigJson.storageBucket || "apna-shoes9540.firebasestorage.app",
  messagingSenderId: firebaseConfigJson.messagingSenderId || "156564754807",
  appId: firebaseConfigJson.appId || "1:156564754807:web:054fc1f7f4e3f3806f5172",
  measurementId: firebaseConfigJson.measurementId || "G-DDTDS30N0S",
};

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore (handles named database if provisioned or default)
export const db = firebaseConfigJson.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Safe Analytics initialization (only in browser environments where supported)
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('[Firebase] Analytics initialized successfully');
      }
    })
    .catch((err) => {
      console.warn('[Firebase] Analytics not supported:', err);
    });
}

// Validate connection to Firestore as required by Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Firestore connected successfully');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('[Firebase] Please check your Firebase configuration.');
    }
  }
}

if (typeof window !== 'undefined') {
  testConnection();
}

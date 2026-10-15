import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

// Same Firebase project as the Android app, so both apps share the same data.
const firebaseConfig = {
  apiKey: 'AIzaSyD2-4levDjFd6ZqebPczY4qCSgHycRrLmk',
  authDomain: 'installment-calculator-app.firebaseapp.com',
  projectId: 'installment-calculator-app',
  storageBucket: 'installment-calculator-app.firebasestorage.app',
  messagingSenderId: '49706133820',
  appId: '1:49706133820:web:390784e723f42158b19639',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auto-detect long polling makes Firestore work reliably on desktop networks/proxies.
// initializeFirestore throws if called twice (e.g. on hot reload), so fall back to getFirestore.
function createFirestore() {
  try {
    return initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  } catch {
    return getFirestore(app);
  }
}

export const firestore = createFirestore();

import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseFallbackConfig = {
  apiKey: 'AIzaSyAz-DK9xjSLYPjwL-sKHaE14OWs3kWphwc',
  authDomain: 'ryori-hiroba.firebaseapp.com',
  projectId: 'ryori-hiroba',
  storageBucket: 'ryori-hiroba.firebasestorage.app',
  messagingSenderId: '159550416341',
  appId: '1:159550416341:web:215b127fcf4223b8e7495c',
};

// Firebase 웹 설정값은 클라이언트에서 공개되는 값이라 배포 환경에서 기본값으로도 사용합니다.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseFallbackConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || firebaseFallbackConfig.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseFallbackConfig.projectId,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || firebaseFallbackConfig.storageBucket,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    firebaseFallbackConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || firebaseFallbackConfig.appId,
};

const requiredFirebaseKeys = [
  ['NEXT_PUBLIC_FIREBASE_API_KEY', firebaseConfig.apiKey],
  ['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', firebaseConfig.authDomain],
  ['NEXT_PUBLIC_FIREBASE_PROJECT_ID', firebaseConfig.projectId],
  ['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', firebaseConfig.storageBucket],
  ['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', firebaseConfig.messagingSenderId],
  ['NEXT_PUBLIC_FIREBASE_APP_ID', firebaseConfig.appId],
] as const;

const isPlaceholder = (value: string | undefined) =>
  !value || value.includes('YOUR_') || value.includes('YOUR_PROJECT');

export const getFirebaseMissingKeys = () =>
  requiredFirebaseKeys
    .filter(([, value]) => isPlaceholder(value))
    .map(([key]) => key);

export const isFirebaseConfigured = () => getFirebaseMissingKeys().length === 0;

const getFirebaseApp = () => {
  const missingKeys = getFirebaseMissingKeys();
  if (missingKeys.length > 0) {
    throw new Error(`Firebase 설정이 필요합니다: ${missingKeys.join(', ')}`);
  }

  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
};

export const getFirebaseAuth = () => getAuth(getFirebaseApp());
export const getFirebaseDb = () => getFirestore(getFirebaseApp());
export const getFirebaseStorage = () => getStorage(getFirebaseApp());
export default getFirebaseApp;

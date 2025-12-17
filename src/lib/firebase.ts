import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDV09qLWUuHdECFV9JBXMfcvzQNfVT9lIg",
  authDomain: "d2d-tracker-8ace9.firebaseapp.com",
  projectId: "d2d-tracker-8ace9",
  storageBucket: "d2d-tracker-8ace9.firebasestorage.app",
  messagingSenderId: "429038202788",
  appId: "1:429038202788:web:5a8331886d1fb4cafc1b31",
  measurementId: "G-M6G6PBJGMS"
}

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Initialize services
export const db = getFirestore(app)
export const auth = getAuth(app)

export default app


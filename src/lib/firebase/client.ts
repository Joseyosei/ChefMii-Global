import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'project-c5daea85-d002-4d77-a3f.firebaseapp.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'project-c5daea85-d002-4d77-a3f',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'project-c5daea85-d002-4d77-a3f.firebasestorage.app',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '193892859007',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:193892859007:web:chefmiiclientapp',
}

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const auth: Auth = getAuth(app)
const db: Firestore = getFirestore(app)
// Storage backs verification document uploads and ChefTV video uploads.
const storage: FirebaseStorage = getStorage(app)
const googleProvider = new GoogleAuthProvider()

export { app, auth, db, storage, googleProvider }

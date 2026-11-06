import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getStorage, type Storage } from 'firebase-admin/storage'

/**
 * The Cloud Storage bucket holding verification documents.
 *
 * Needed so admins can mint short-lived signed URLs for private identity
 * documents, which are never world-readable (see `storage.rules`).
 */
const STORAGE_BUCKET =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'project-c5daea85-d002-4d77-a3f.firebasestorage.app'

function getAdminApp(): App {
    if (getApps().length > 0) {
        return getApp()
    }

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (serviceAccountKey) {
        try {
            const decoded = Buffer.from(serviceAccountKey, 'base64').toString('utf-8')
            const serviceAccount = JSON.parse(decoded)
            return initializeApp({
                credential: cert(serviceAccount),
                projectId: serviceAccount.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                storageBucket: STORAGE_BUCKET,
            })
        } catch (e) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY base64 JSON:', e)
        }
    }

    return initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'project-c5daea85-d002-4d77-a3f',
        storageBucket: STORAGE_BUCKET,
    })
}

const adminApp = getAdminApp()
const adminAuth: Auth = getAuth(adminApp)
const adminDb: Firestore = getFirestore(adminApp)
const adminStorage: Storage = getStorage(adminApp)

export { adminApp, adminAuth, adminDb, adminStorage, STORAGE_BUCKET }

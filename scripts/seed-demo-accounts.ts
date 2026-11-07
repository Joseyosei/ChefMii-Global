/**
 * Provision the owner's three demo login accounts: client, chef, business.
 *
 * These replace the old "1-Click Hackathon Demo Login", which minted a
 * localStorage-only session with no real user behind it and let ANY visitor
 * become a business account. These are real Firebase Auth accounts with a real
 * password that only the owner knows, each with the correct role, so you can
 * sign in to all three dashboards from the normal login page.
 *
 * ── Run it (locally, with the project's service account) ──────────────
 *
 *   export FIREBASE_SERVICE_ACCOUNT_KEY="$(base64 -w0 serviceAccountKey.json)"
 *   export DEMO_ACCOUNT_PASSWORD='choose-a-strong-one'
 *   npm run seed:demo-accounts            # create / update the three accounts
 *   npm run seed:demo-accounts -- --delete   # remove them again
 *
 * DEMO_ACCOUNT_PASSWORD is required and has no default: a hardcoded demo
 * password committed to a repo is a credential leak, so the script refuses to
 * run without one. Optionally override the emails with DEMO_EMAIL_CLIENT /
 * DEMO_EMAIL_CHEF / DEMO_EMAIL_BUSINESS.
 *
 * Idempotent: an account that already exists has its password, role claim and
 * profile refreshed rather than duplicated.
 */

import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import type { UserRole } from '../src/context/auth-context'

const DELETE = process.argv.includes('--delete')

interface DemoAccount {
    role: Extract<UserRole, 'client' | 'chef' | 'business'>
    email: string
    fullName: string
}

const ACCOUNTS: DemoAccount[] = [
    {
        role: 'client',
        email: process.env.DEMO_EMAIL_CLIENT || 'demo.client@chefmii.com',
        fullName: 'Jo (Demo Client)',
    },
    {
        role: 'chef',
        email: process.env.DEMO_EMAIL_CHEF || 'demo.chef@chefmii.com',
        fullName: 'Jo (Demo Chef)',
    },
    {
        role: 'business',
        email: process.env.DEMO_EMAIL_BUSINESS || 'demo.business@chefmii.com',
        fullName: 'Jo (Demo Business)',
    },
]

function initAdmin() {
    if (getApps().length > 0) return

    const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (!key) {
        console.error(
            'FIREBASE_SERVICE_ACCOUNT_KEY is not set.\n' +
            '  export FIREBASE_SERVICE_ACCOUNT_KEY="$(base64 -w0 serviceAccountKey.json)"',
        )
        process.exit(1)
    }

    try {
        const serviceAccount = JSON.parse(Buffer.from(key, 'base64').toString('utf-8'))
        initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id })
    } catch (err) {
        console.error('Could not parse FIREBASE_SERVICE_ACCOUNT_KEY as base64 JSON:', err)
        process.exit(1)
    }
}

async function remove() {
    const auth = getAuth()
    const db = getFirestore()

    for (const acct of ACCOUNTS) {
        try {
            const user = await auth.getUserByEmail(acct.email)
            await auth.deleteUser(user.uid)
            await db.collection('users').doc(user.uid).delete().catch(() => {})
            await db.collection('chefs').doc(user.uid).delete().catch(() => {})
            console.log(`  DELETED  ${acct.email}`)
        } catch {
            console.log(`  (none)   ${acct.email} — nothing to delete`)
        }
    }
    console.log('\nDemo accounts removed.')
}

async function upsert() {
    const password = process.env.DEMO_ACCOUNT_PASSWORD
    if (!password || password.length < 8) {
        console.error(
            'DEMO_ACCOUNT_PASSWORD is required and must be at least 8 characters.\n' +
            "  export DEMO_ACCOUNT_PASSWORD='choose-a-strong-one'",
        )
        process.exit(1)
    }

    const auth = getAuth()
    const db = getFirestore()

    for (const acct of ACCOUNTS) {
        // Create or fetch the auth user.
        let uid: string
        try {
            const existing = await auth.getUserByEmail(acct.email)
            uid = existing.uid
            await auth.updateUser(uid, {
                password,
                displayName: acct.fullName,
                emailVerified: true,
            })
            console.log(`  UPDATED  ${acct.role.padEnd(9)} ${acct.email}`)
        } catch {
            const created = await auth.createUser({
                email: acct.email,
                password,
                displayName: acct.fullName,
                emailVerified: true,
            })
            uid = created.uid
            console.log(`  CREATED  ${acct.role.padEnd(9)} ${acct.email}`)
        }

        // Signed role claim — the server trusts this over the Firestore field.
        await auth.setCustomUserClaims(uid, { role: acct.role, demo: true })

        // Profile document the app reads for role + display.
        await db.collection('users').doc(uid).set(
            {
                email: acct.email,
                full_name: acct.fullName,
                role: acct.role,
                is_demo: true,
                created_by: 'seed-demo-accounts',
                updated_at: FieldValue.serverTimestamp(),
            },
            { merge: true },
        )

        // Give the chef account a published directory profile so the chef
        // dashboard and the directory have something real to show.
        if (acct.role === 'chef') {
            await db.collection('chefs').doc(uid).set(
                {
                    userId: uid,
                    slug: 'demo-chef',
                    name: acct.fullName,
                    bio: 'Demo chef account for previewing the chef experience end to end.',
                    chefType: 'professional',
                    cuisines: ['Italian'],
                    specialties: ['Handmade pasta'],
                    yearsExperience: 10,
                    hourlyRate: 120,
                    currency: 'GBP',
                    minGuests: 2,
                    maxGuests: 12,
                    locationCity: 'London',
                    locationCountry: 'United Kingdom',
                    badgeTier: 'pro',
                    avgRating: 4.9,
                    totalReviews: 24,
                    isVerified: true,
                    isAvailable: true,
                    isPublished: true,
                    is_demo: true,
                    updatedAt: FieldValue.serverTimestamp(),
                    createdAt: FieldValue.serverTimestamp(),
                },
                { merge: true },
            )
        }
    }

    console.log('\nDemo accounts ready. Sign in at /login with the password you set:')
    for (const acct of ACCOUNTS) {
        console.log(`  ${acct.role.padEnd(9)} ${acct.email}`)
    }
    console.log('\nThese are real accounts. Rotate the password or run with --delete when done.')
}

async function main() {
    initAdmin()
    console.log(`\n${DELETE ? 'REMOVING' : 'PROVISIONING'} demo accounts (client, chef, business)\n`)
    if (DELETE) await remove()
    else await upsert()
}

main().catch((err) => {
    console.error('\nSeeding failed:', err)
    process.exit(1)
})

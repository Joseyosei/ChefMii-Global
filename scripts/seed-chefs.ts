/**
 * Seed the `chefs` collection from the demo catalogue.
 *
 * Run locally with the service account that owns the Firebase project:
 *
 *   npx tsx scripts/seed-chefs.ts            # dry run, prints what it would write
 *   npx tsx scripts/seed-chefs.ts --commit   # actually writes
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_KEY (base64 service-account JSON) in the
 * environment, the same variable the app uses.
 *
 * SAFETY
 *  - Dry run by default. Nothing is written without --commit.
 *  - Writes are `set({ merge: true })` keyed on the slug, so re-running is
 *    idempotent and never deletes anything.
 *  - It REFUSES to overwrite a document that has `isSeed !== true`, so a real
 *    onboarded chef can never be clobbered by demo data.
 *  - Seeded records carry `isSeed: true` and `stripeAccountId: null`, so they
 *    are visibly demo data and can never be paid out to.
 */

import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { SEED_CHEFS, type SeedChef } from '../src/lib/chefs/seed-catalogue'

const COMMIT = process.argv.includes('--commit')

function initAdmin() {
  if (getApps().length > 0) return

  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!key) {
    console.error(
      'FIREBASE_SERVICE_ACCOUNT_KEY is not set.\n' +
        'Export the base64-encoded service account JSON first:\n' +
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

/** Map a seed record into a `chefs` document. */
function toDocument(seed: SeedChef) {
  const [city, ...country] = seed.location.split(',').map((s) => s.trim())
  const badgeTier = seed.rating >= 4.9 ? 'elite' : seed.rating >= 4.7 ? 'pro' : 'verified'

  return {
    userId: seed.id,
    slug: seed.id,
    name: seed.name,
    bio: seed.bio,
    chefType: 'professional',
    cuisines: [seed.cuisine],
    specialties: [seed.badge],
    yearsExperience: 0,
    hourlyRate: seed.rate,
    currency: 'GBP',
    minGuests: 2,
    maxGuests: 12,
    locationCity: city ?? '',
    locationCountry: country.join(', '),
    photoUrl: seed.photo,
    galleryUrls: [],
    badgeTier,
    avgRating: seed.rating,
    totalReviews: seed.reviews,
    isVerified: true,
    isAvailable: true,
    isPublished: true,
    /** Marks this as demo data, not a real onboarded chef. */
    isSeed: true,
    // Deliberately null: a seed chef has no bank account and must never be
    // selected as a payout destination.
    stripeAccountId: null,
    stripeStatus: 'none',
    chargesEnabled: false,
    payoutsEnabled: false,
    updatedAt: FieldValue.serverTimestamp(),
  }
}

async function main() {
  initAdmin()
  const db = getFirestore()

  console.log(
    `\n${COMMIT ? 'COMMITTING' : 'DRY RUN'}: ${SEED_CHEFS.length} seed chefs -> chefs collection\n`,
  )

  let created = 0
  let updated = 0
  let skipped = 0

  for (const seed of SEED_CHEFS) {
    const ref = db.collection('chefs').doc(seed.id)
    const snap = await ref.get()

    if (snap.exists && snap.data()?.isSeed !== true) {
      console.log(`  SKIP   ${seed.id} — exists and is not seed data. Leaving it alone.`)
      skipped++
      continue
    }

    const action = snap.exists ? 'UPDATE' : 'CREATE'
    console.log(`  ${action} ${seed.id.padEnd(20)} ${seed.name} — £${seed.rate}/hr`)

    if (COMMIT) {
      await ref.set(
        {
          ...toDocument(seed),
          ...(snap.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
        },
        { merge: true },
      )
    }

    if (snap.exists) updated++
    else created++
  }

  console.log(
    `\n${COMMIT ? 'Done' : 'Dry run complete'}: ${created} to create, ${updated} to update, ${skipped} skipped.`,
  )

  if (!COMMIT) {
    console.log('Re-run with --commit to write these records.\n')
  }
}

main().catch((err) => {
  console.error('\nSeeding failed:', err)
  process.exit(1)
})

/**
 * Firestore security rules test suite.
 *
 * Run with:  npm run test:rules
 *
 * Starts the Firestore emulator against the real `firestore.rules` file and
 * asserts the security properties that matter, rather than trusting the rules
 * by inspection. Covers: privilege escalation to admin, chefs self-publishing
 * or self-verifying, clients editing booking money fields, and the payout
 * ledger being server-write-only.
 *
 * Two things worth knowing if a test fails:
 *
 *  - `doesNotChange()` in the rules only blocks a write that CHANGES a value.
 *    Writing an identical value is a no-op and is correctly allowed, so a
 *    fixture must differ from what the test writes or it passes for the wrong
 *    reason.
 *  - The emulator keeps data between runs, which turns a `create` test into an
 *    `update`. `clearFirestore()` below guards against that.
 *
 * Behind a proxy that intercepts gRPC, prefix the command with
 * `no_grpc_proxy=127.0.0.1:8899 grpc_proxy=`.
 */

import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { readFileSync } from 'node:fs'

const env = await initializeTestEnvironment({
  projectId: 'demo-chefmii',
  firestore: { host: '127.0.0.1', port: 8899, rules: readFileSync('firestore.rules', 'utf8') },
})

let pass = 0, fail = 0
async function t(label, fn) {
  try { await fn(); console.log(`PASS  ${label}`); pass++ }
  catch (e) { console.log(`FAIL  ${label}\n        ${e.message?.slice(0,200)}`); fail++ }
}

// The emulator keeps state between runs, so a leftover document turns a
// `create` test into an `update` and fails for the wrong reason.
await env.clearFirestore()

// Seed data bypassing rules.
await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore()
  await setDoc(doc(db, 'users/alice'), { email: 'a@x.com', role: 'client' })
  await setDoc(doc(db, 'users/bob'), { email: 'b@x.com', role: 'chef' })
  await setDoc(doc(db, 'users/root'), { email: 'r@x.com', role: 'admin' })
  await setDoc(doc(db, 'chefs/bob'), { userId: 'bob', name: 'Bob', isPublished: true, isVerified: true, hourlyRate: 100, badgeTier: 'pro', stripeAccountId: 'acct_1' })
  await setDoc(doc(db, 'chefs/carol'), { userId: 'carol', name: 'Carol', isPublished: false, isVerified: false })
  await setDoc(doc(db, 'chef_verification/bob'), { chefId: 'bob', isFullyVerified: true })
  await setDoc(doc(db, 'chef_applications/bob'), { userId: 'bob', status: 'submitted' })
  await setDoc(doc(db, 'payouts/p1'), { bookingId: 'bk1', chefId: 'bob', netAmountMinor: 9000 })
  await setDoc(doc(db, 'bookings/bk1'), { client_id: 'alice', chef_id: 'bob', total_amount: 450, platform_fee: 45, payout_status: 'held', payment_status: 'paid', status: 'confirmed' })
  await setDoc(doc(db, 'notifications/n1'), { user_id: 'alice', is_read: false, title: 'Hi' })
  // Fixtures for "cannot escalate" tests. The values must DIFFER from what the
  // test writes, because doesNotChange() only blocks an actual change -- a
  // no-op write of an identical value is correctly permitted.
  await setDoc(doc(db, 'chefs/dave'), { userId: 'dave', name: 'Dave', isPublished: false, isVerified: false, bio: 'old', avgRating: 4.0 })
  await setDoc(doc(db, 'users/dave'), { email: 'd@x.com', role: 'chef' })
  await setDoc(doc(db, 'users/noRole'), { email: 'n@x.com' })
  await setDoc(doc(db, 'bookings/bk2'), { client_id: 'alice', chef_id: 'bob', total_amount: 100, payment_status: 'pending', payout_status: 'unpaid', status: 'pending_payment' })
})

const alice = env.authenticatedContext('alice').firestore()
const bob = env.authenticatedContext('bob').firestore()
const root = env.authenticatedContext('root').firestore()
const dave = env.authenticatedContext('dave').firestore()
const noRole = env.authenticatedContext('noRole').firestore()
const anon = env.unauthenticatedContext().firestore()

console.log('\n--- PRIVILEGE ESCALATION (the fix) ---')
await t('user CANNOT promote self to admin', () => assertFails(updateDoc(doc(alice,'users/alice'), { role: 'admin' })))
await t('user CANNOT grant self stripe_account_id', () => assertFails(updateDoc(doc(alice,'users/alice'), { stripe_account_id: 'acct_evil' })))
await t('user CAN update own harmless field', () => assertSucceeds(updateDoc(doc(alice,'users/alice'), { phone: '+447551674140' })))

console.log('\n--- CHEF DIRECTORY (was default-denied entirely) ---')
await t('anon CAN read a published chef', () => assertSucceeds(getDoc(doc(anon,'chefs/bob'))))
await t('anon CANNOT read an unpublished chef', () => assertFails(getDoc(doc(anon,'chefs/carol'))))
await t('chef CAN edit own bio', () => assertSucceeds(updateDoc(doc(bob,'chefs/bob'), { bio: 'Updated bio' })))
await t('chef CANNOT self-publish (unpublished -> published)', () => assertFails(updateDoc(doc(dave,'chefs/dave'), { isPublished: true })))
await t('chef CANNOT self-verify (false -> true)', () => assertFails(updateDoc(doc(dave,'chefs/dave'), { isVerified: true })))
await t('chef CANNOT self-promote badge tier', () => assertFails(updateDoc(doc(dave,'chefs/dave'), { badgeTier: 'elite' })))
await t('chef CAN still edit own bio (old -> new)', () => assertSucceeds(updateDoc(doc(dave,'chefs/dave'), { bio: 'new bio' })))
await t('chef CANNOT change own payout account', () => assertFails(updateDoc(doc(bob,'chefs/bob'), { stripeAccountId: 'acct_evil' })))
await t('chef CANNOT inflate own rating', () => assertFails(updateDoc(doc(bob,'chefs/bob'), { avgRating: 5, totalReviews: 9999 })))
await t('other user CANNOT edit a chef profile', () => assertFails(updateDoc(doc(alice,'chefs/bob'), { hourlyRate: 1 })))

console.log('\n--- VERIFICATION IS ADMIN-ONLY ---')
await t('chef CAN read own verification', () => assertSucceeds(getDoc(doc(bob,'chef_verification/bob'))))
await t('chef CANNOT write own verification', () => assertFails(setDoc(doc(bob,'chef_verification/bob'), { isFullyVerified: true })))
await t('other user CANNOT read verification', () => assertFails(getDoc(doc(alice,'chef_verification/bob'))))
await t('admin CAN write verification', () => assertSucceeds(setDoc(doc(root,'chef_verification/bob'), { chefId: 'bob', isFullyVerified: true }, { merge: true })))

console.log('\n--- APPLICATIONS ---')
await t('owner CAN read own application', () => assertSucceeds(getDoc(doc(bob,'chef_applications/bob'))))
await t('other CANNOT read application', () => assertFails(getDoc(doc(alice,'chef_applications/bob'))))
await t('owner CANNOT edit a submitted application', () => assertFails(updateDoc(doc(bob,'chef_applications/bob'), { hourlyRate: 1 })))
await t('admin CAN read application', () => assertSucceeds(getDoc(doc(root,'chef_applications/bob'))))

console.log('\n--- PAYOUT LEDGER IS SERVER-ONLY ---')
await t('chef CANNOT read payout ledger', () => assertFails(getDoc(doc(bob,'payouts/p1'))))
await t('admin CAN read payout ledger', () => assertSucceeds(getDoc(doc(root,'payouts/p1'))))
await t('nobody CAN write payout ledger', () => assertFails(setDoc(doc(root,'payouts/p2'), { bookingId: 'x' })))

console.log('\n--- BOOKING MONEY FIELDS ---')
await t('client CAN read own booking', () => assertSucceeds(getDoc(doc(alice,'bookings/bk1'))))
await t('client CANNOT change total_amount', () => assertFails(updateDoc(doc(alice,'bookings/bk1'), { total_amount: 1 })))
await t('client CANNOT mark payout released', () => assertFails(updateDoc(doc(alice,'bookings/bk1'), { payout_status: 'released' })))
await t('client CANNOT fake payment_status (pending -> paid)', () => assertFails(updateDoc(doc(alice,'bookings/bk2'), { payment_status: 'paid' })))
await t('client CANNOT escalate payout_status (unpaid -> held)', () => assertFails(updateDoc(doc(alice,'bookings/bk2'), { payout_status: 'held' })))
await t('client CAN update special_requests', () => assertSucceeds(updateDoc(doc(alice,'bookings/bk1'), { special_requests: 'No nuts' })))
await t('stranger CANNOT read booking', () => assertFails(getDoc(doc(bob === alice ? alice : env.authenticatedContext('dave').firestore(),'bookings/bk1'))))

console.log('\n--- NOTIFICATIONS ---')
await t('owner CAN mark notification read', () => assertSucceeds(updateDoc(doc(alice,'notifications/n1'), { is_read: true })))
await t('owner CANNOT rewrite notification text', () => assertFails(updateDoc(doc(alice,'notifications/n1'), { title: 'Hacked' })))

console.log('\n--- isAdmin() ROBUSTNESS (user doc with no role field) ---')
await t('roleless user CAN still update own profile', () => assertSucceeds(updateDoc(doc(noRole,'users/noRole'), { phone: '+440000000000' })))
await t('roleless user is NOT treated as admin', () => assertFails(getDoc(doc(noRole,'payouts/p1'))))

console.log('\n--- WAITLIST (unchanged behaviour) ---')
await t('anon CAN join waitlist', () => assertSucceeds(setDoc(doc(anon,'waitlist/w1'), { email: 'x@y.com' })))
await t('anon CANNOT read waitlist', () => assertFails(getDoc(doc(anon,'waitlist/w1'))))

await env.cleanup()
console.log(`\n${fail === 0 ? 'ALL RULES TESTS PASSED' : fail + ' RULES TEST(S) FAILED'}  (${pass} passed, ${fail} failed)`)
process.exit(fail === 0 ? 0 : 1)

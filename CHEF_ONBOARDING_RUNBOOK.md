# Chef onboarding, verification and payments — runbook

Everything in this document refers to work on the branch
`feat/chef-onboarding-verification-payments`.

Read the **Deploy order** section before merging. Two steps must happen before
the code goes live or parts of the app will fail at runtime.

---

## 1. What was built

### Chef onboarding

| Route | What it does |
|---|---|
| `/become-a-chef/apply` | Three-step application form, then the verification panel with document uploads |
| `POST /api/chefs/apply` | Submits or updates an application. Creates the verification record |
| `GET /api/chefs/apply` | The signed-in user's own application and stage progress |
| `POST /api/chefs/documents` | Registers a file already uploaded to Cloud Storage and moves that stage into review |
| `GET /api/chefs/documents` | The caller's own uploaded documents |

Files upload straight from the browser to Cloud Storage. A 200 MB cooking video
never passes through a serverless function, so it cannot hit the request body
limit.

### Verification and admin review

| Route | What it does |
|---|---|
| `/admin/chefs` | Review console: applicant details, documents, approve / request changes per stage |
| `GET /api/admin/chef-applications` | The review queue, oldest submission first |
| `POST /api/admin/chef-applications/{chefId}` | Records a decision on one stage |
| `GET /api/admin/chef-documents/{documentId}` | A 10-minute signed URL for a private document, with an audit entry |

Three stages, unlocked in order: **Identity** (24h) → **Credentials** (48h) →
**Quality** (72h). A chef profile is published, and the user promoted to the
`chef` role, only when all three are approved. That transition exists in exactly
one place, `syncVerificationState`, so no future call site can list an
unverified chef by accident.

Rejections require a reason, which is shown to the chef and emailed to them.

### Payments

Escrow is now implemented as **separate charge and transfer**:

1. the client pays, and the charge settles into the **platform** Stripe balance
2. after the event date, the daily sweep transfers the chef's share to their
   connected account and writes a row to the `payouts` ledger

### Public chef directory

`/find-chefs` now reads live chefs from `GET /api/chefs` instead of a hardcoded
array, so an approved chef actually appears on the site. The 16 demo chefs moved
to `src/lib/chefs/seed-catalogue.ts` and are used as a fallback whenever
Firestore returns nothing, so the marketplace never renders an empty grid.

---

## 2. Bugs found in production code and fixed

These were live on `main`. Listed worst first.

### 2.1 Chefs were paid twice for the same booking

`/api/checkout` created a Stripe **destination charge**
(`payment_intent_data.transfer_data.destination`), which transfers money to the
chef the moment the client pays. The payout cron then found the same booking
(`status: confirmed`, `payout_status: held`) and called `stripe.transfers.create`
for it as well.

Every booking taken through checkout with a connected chef paid that chef twice.
It also was not escrow in any sense, because the funds had already left the
platform before the event.

Fixed by removing `transfer_data` so the charge is held on the platform account
and released once, after the event.

### 2.2 Failed payouts were recorded as paid

`/api/stripe/payout/release` set `payout_status: 'released'` from inside the
`catch` block of a failed `stripe.transfers.create`. The chef had not received
anything, the system recorded that they had, and the booking was never picked up
again.

Payout state now comes from the actual Stripe result. A failure is written to the
ledger with its reason and stays eligible for the next sweep.

### 2.3 Anyone could act as any user

`/api/bookings`, `/api/checkout` and `/api/stripe/connect` verified the Firebase
ID token inside a `try/catch`, logged a warning on failure, then fell back to
`body.userId` / `body.chefId`. An unauthenticated caller could create bookings
in someone else's name, or mint a Stripe Connect onboarding link against another
chef's account.

The chef dashboard made this concrete: it sent
`chefId: user?.id || 'marco-rossi'`, so a signed-out visitor hit a real chef's
record.

Identity now comes only from a verified token, via `requireAuth` in
`src/lib/auth/server-auth.ts`. There is no body fallback anywhere.

### 2.4 Anyone could mark a booking paid without paying

The Stripe webhook fell back to `JSON.parse(body)` whenever a signature or
secret was absent. A fabricated `checkout.session.completed` naming any
`bookingId` would mark it paid, confirmed and eligible for payout.

A signature is now mandatory outside development.

### 2.5 The payout cron was unauthenticated

The check was `if (apiKey && apiKey !== secret) reject`. A request with no key at
all passed. `requireCronAuth` now requires a matching secret and compares it in
constant time.

### 2.6 Any user could make themselves an admin

`firestore.rules` had `allow write: if isOwner(userId)` on `/users/{userId}` with
no field restrictions, so any signed-in user could set their own
`role: 'admin'` and reach the admin console. Sign-up still sets a role, but
`admin` is excluded, and `role`, Stripe and subscription fields are now
server-write-only.

### 2.7 The chef directory was unreadable by clients

Neither `chefs` nor `chef_profiles` had any rule, so both fell through to the
default deny and every client-side read failed. `/api/bookings` read from
`chefs` while `src/types/database.ts` described `chef_profiles`. Collection
names are now centralised in `src/lib/firebase/collections.ts`.

### 2.8 Failed checkout showed the guest a confirmed booking

`/api/checkout` returned a fake session URL pointing at
`/user-dashboard?booking_success=true` when the Stripe call threw, and the
booking page called `setBookingComplete(true)` from its `catch` block. A failure
looked like success to the guest. Both now surface the failure, and the fake
session exists only outside production.

---

## 3. Deploy order

**Do these two before merging**, or the code will fail at runtime.

### Step 1 — Deploy rules and indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Indexes must exist before the queries that need them run; Firestore rejects a
compound query whose index is missing. Storage rules must exist before the first
document upload, or uploads are denied.

Verify the rules first:

```bash
npm run test:rules   # 37 assertions against the emulator
```

### Step 2 — Set `CRON_SECRET`

```bash
openssl rand -hex 32
```

Add it to the Vercel project environment variables. `vercel.json` now schedules
`/api/stripe/payout/release` daily at 07:00 UTC, and the route rejects any
request without this secret. **If it is unset, every run fails and no chef is
ever paid.**

### Step 3 — Make yourself an admin

The admin console requires `users/{yourUid}.role === 'admin'`. Set it once in the
Firebase console, or set a custom claim, which is stronger because it is signed:

```js
await admin.auth().setCustomUserClaims(uid, { role: 'admin' })
```

### Step 4 — Optional: seed the directory

```bash
export FIREBASE_SERVICE_ACCOUNT_KEY="$(base64 -w0 serviceAccountKey.json)"
npm run seed:chefs            # dry run, prints what it would write
npm run seed:chefs -- --commit
```

Idempotent, and it refuses to overwrite any document that is not already marked
`isSeed: true`, so a real chef can never be clobbered by demo data.

### Step 5 — Stripe

The platform account needs the **transfers** capability, and the platform
balance must cover payouts at release time. A `balance_insufficient` failure is
recorded in the ledger with that reason and retried on the next sweep.

---

## 4. Verification performed

| Check | Result |
|---|---|
| `tsc --noEmit` | 0 errors |
| `next build` | passes, all 39 routes compile |
| `npm run lint` | 0 errors in new or modified files |
| `npm run test:rules` | 37 / 37 pass against the Firestore emulator |
| Money arithmetic | 33 runtime assertions, including `150.10 × 3` float safety |

What has **not** been tested: live Stripe calls and live Firestore writes. The
Vercel connector is read-only here, so no credentials were available. Before
taking real money, run one booking end to end in Stripe test mode and confirm:

1. the charge lands in the **platform** balance, not the chef's
2. the webhook sets `payout_status: 'held'`
3. a manual `POST /api/stripe/payout/release` with the cron secret creates
   exactly **one** transfer and one `payouts` row

---

## 5. Known issues not addressed

- **Two Next configs.** `next.config.js` and `next.config.mjs` both exist. Only
  `next.config.js` takes effect; the `.mjs` is an empty config. Deleting the
  `.mjs` would avoid a future surprise, but it was left alone to avoid changing
  build behaviour in the same branch as the payment fixes.
- **Two fee models.** `/api/checkout` adds the 10% fee on top of the chef's rate
  (guest pays it, chef receives their full rate). The old `/api/bookings`
  deducted it from the total. Both routes now use the on-top model for
  consistency, but this is a pricing decision worth a deliberate call.
- **Pre-existing lint debt.** 196 ESLint errors across 38 files on `main`, almost
  all unused imports. `next.config.js` sets `eslint.ignoreDuringBuilds: true`, so
  they do not block deploys. Untouched here apart from the files this branch
  edits.
- **Still hardcoded**: Academy courses, the marketplace catalogue, and the
  farmers and suppliers list. These are the next slices.

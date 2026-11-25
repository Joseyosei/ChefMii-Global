'use client'

/**
 * CheftTV engagement: likes and follows that actually persist and aggregate.
 *
 * WHY THIS EXISTS
 * The old feed showed like and follow state in local `useState` only. The
 * displayed like count never changed in the database, follows were a toast and
 * nothing more, and the ranking algorithm (scoreItems) therefore sorted on dead
 * numbers. The old like handler also wrote to `users/{uid}/likes/{id}`, a path
 * the tightened security rules do not grant, so those writes now fail.
 *
 * This uses two top-level collections that the data model already declares
 * (`media_likes`, `chef_follows`), each keyed `{uid}_{targetId}` so a like or
 * follow is naturally deduplicated, and increments the aggregate count on
 * `chef_media` inside a transaction so the number on screen is the real one.
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase/client'
import { COLLECTIONS } from '@/lib/firebase/collections'

function likeId(uid: string, mediaId: string): string {
  return `${uid}_${mediaId}`
}

function followId(uid: string, chefId: string): string {
  return `${uid}_${chefId}`
}

/**
 * Toggle a like, transactionally keeping `chef_media.likes` in step.
 * Returns the new liked state. Never throws for a seed item (no real doc).
 */
export async function toggleLike(mediaId: string): Promise<boolean> {
  const user = auth.currentUser
  if (!user) throw new Error('Sign in to like videos.')

  const likeRef = doc(db, COLLECTIONS.MEDIA_LIKES, likeId(user.uid, mediaId))
  const mediaRef = doc(db, COLLECTIONS.CHEF_MEDIA, mediaId)

  return runTransaction(db, async (tx) => {
    const [likeSnap, mediaSnap] = await Promise.all([tx.get(likeRef), tx.get(mediaRef)])

    // Seed items have no backing document; there is nothing to aggregate.
    const mediaExists = mediaSnap.exists()

    if (likeSnap.exists()) {
      tx.delete(likeRef)
      if (mediaExists) tx.update(mediaRef, { likes: increment(-1) })
      return false
    }

    tx.set(likeRef, {
      user_id: user.uid,
      media_id: mediaId,
      createdAt: serverTimestamp(),
    })
    if (mediaExists) tx.update(mediaRef, { likes: increment(1) })
    return true
  })
}

/** Toggle following a chef. Returns the new followed state. */
export async function toggleFollow(chefId: string): Promise<boolean> {
  const user = auth.currentUser
  if (!user) throw new Error('Sign in to follow chefs.')
  if (user.uid === chefId) throw new Error('You cannot follow yourself.')

  const ref = doc(db, COLLECTIONS.CHEF_FOLLOWS, followId(user.uid, chefId))
  const snap = await getDoc(ref)

  if (snap.exists()) {
    await deleteDoc(ref)
    return false
  }

  await setDoc(ref, {
    follower_id: user.uid,
    chef_id: chefId,
    createdAt: serverTimestamp(),
  })
  return true
}

/** The set of media ids the current user has liked. Empty when signed out. */
export async function loadLikedMediaIds(): Promise<Set<string>> {
  const user = auth.currentUser
  if (!user) return new Set()

  try {
    const snap = await getDocs(
      query(collection(db, COLLECTIONS.MEDIA_LIKES), where('user_id', '==', user.uid)),
    )
    return new Set(snap.docs.map((d) => (d.data().media_id as string) ?? ''))
  } catch (err) {
    console.warn('[engagement] could not load likes:', err)
    return new Set()
  }
}

/** The set of chef ids the current user follows. Empty when signed out. */
export async function loadFollowedChefIds(): Promise<Set<string>> {
  const user = auth.currentUser
  if (!user) return new Set()

  try {
    const snap = await getDocs(
      query(collection(db, COLLECTIONS.CHEF_FOLLOWS), where('follower_id', '==', user.uid)),
    )
    return new Set(snap.docs.map((d) => (d.data().chef_id as string) ?? ''))
  } catch (err) {
    console.warn('[engagement] could not load follows:', err)
    return new Set()
  }
}

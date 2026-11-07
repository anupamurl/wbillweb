'use client';

import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from './firebase';

/**
 * Live watch on blocks/{uid}, the admin's block record for this user.
 * Calls back with true when it exists. If it can't be read (offline,
 * rules not yet published) the user is treated as not blocked here;
 * Firestore's rules still refuse a blocked user's data either way.
 */
export function watchBlocked(uid: string, onChange: (blocked: boolean) => void): () => void {
  return onSnapshot(
    doc(firestore(), 'blocks', uid),
    (snap) => onChange(snap.exists()),
    () => onChange(false),
  );
}

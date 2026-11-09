'use client';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firebaseAuth, firestore } from './firebase';
import type { RequestDraft } from './rightsRequestForm';

/** Saves a privacy request or grievance. Works with or without a login. */
export async function submitRightsRequest(d: RequestDraft) {
  const auth = firebaseAuth();
  await auth.authStateReady();
  await addDoc(collection(firestore(), 'rightsRequests'), {
    type: d.type,
    name: d.name.trim().slice(0, 80),
    contact: d.contact.trim().slice(0, 254),
    details: d.details.trim().slice(0, 1000),
    shopName: d.shopName.trim().slice(0, 80),
    uid: auth.currentUser?.uid ?? '',
    status: 'new',
    at: serverTimestamp(),
  });
}

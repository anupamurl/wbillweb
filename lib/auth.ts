'use client';

import {
  type AuthError,
  GoogleAuthProvider,
  linkWithCredential,
  linkWithPopup,
  type OAuthCredential,
  PhoneAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  unlink,
} from 'firebase/auth';
import { firebaseAuth } from './firebase';

/**
 * Phone OTP and Google sign-in against Firebase Auth — the same provider
 * the mobile app uses. Firebase verifies the OTP and the Google identity
 * token on its own servers; nothing here decides who is signed in, it only
 * calls the SDK and surfaces readable errors.
 */

let recaptcha: RecaptchaVerifier | null = null;

/** Invisible reCAPTCHA, required by Firebase phone auth on web. One per page. */
function getRecaptcha(containerId: string): RecaptchaVerifier {
  recaptcha ??= new RecaptchaVerifier(firebaseAuth(), containerId, { size: 'invisible' });
  return recaptcha;
}

export function resetRecaptcha() {
  recaptcha?.clear();
  recaptcha = null;
}

export type OtpHandle = { confirm: (code: string) => Promise<void> };

/** Sends an OTP to an E.164 number (e.g. +919876543210). */
export async function sendOtp(e164Phone: string, recaptchaContainerId: string): Promise<OtpHandle> {
  const verifier = getRecaptcha(recaptchaContainerId);
  const confirmation = await signInWithPhoneNumber(firebaseAuth(), e164Phone, verifier);
  return {
    confirm: async (code: string) => {
      await confirmation.confirm(code);
    },
  };
}

/**
 * Sends an OTP to link a phone number to the *currently signed-in* account
 * (e.g. a Google user adding phone login), without signing out first.
 */
export async function sendOtpForLinking(e164Phone: string, recaptchaContainerId: string): Promise<{ verificationId: string }> {
  const verifier = getRecaptcha(recaptchaContainerId);
  const provider = new PhoneAuthProvider(firebaseAuth());
  const verificationId = await provider.verifyPhoneNumber(e164Phone, verifier);
  return { verificationId };
}

export async function confirmLinkOtp(verificationId: string, code: string) {
  const credential: OAuthCredential = PhoneAuthProvider.credential(verificationId, code) as unknown as OAuthCredential;
  const user = firebaseAuth().currentUser;
  if (!user) throw new Error('Sign in first.');
  await linkWithCredential(user, credential);
}

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  await signInWithPopup(firebaseAuth(), googleProvider);
}

/** Adds Google as a second sign-in method on the current (phone) account. */
export async function linkGoogle() {
  const user = firebaseAuth().currentUser;
  if (!user) throw new Error('Sign in first.');
  await linkWithPopup(user, googleProvider);
}

/**
 * Firebase requires a "recent" sign-in before sensitive actions like
 * deleting the account. These re-verify the current user without
 * signing anyone else in.
 */
export async function reauthenticateWithGoogle() {
  const user = firebaseAuth().currentUser;
  if (!user) throw new Error('Sign in first.');
  await reauthenticateWithPopup(user, googleProvider);
}

export async function sendOtpForReauth(e164Phone: string, recaptchaContainerId: string): Promise<{ verificationId: string }> {
  return sendOtpForLinking(e164Phone, recaptchaContainerId);
}

export async function confirmReauthOtp(verificationId: string, code: string) {
  const credential: OAuthCredential = PhoneAuthProvider.credential(verificationId, code) as unknown as OAuthCredential;
  const user = firebaseAuth().currentUser;
  if (!user) throw new Error('Sign in first.');
  await reauthenticateWithCredential(user, credential);
}

export async function unlinkProvider(providerId: string) {
  const user = firebaseAuth().currentUser;
  if (!user) throw new Error('Sign in first.');
  await unlink(user, providerId);
}

/** Readable text for the errors this flow actually hits. */
export function describeAuthError(error: unknown): string {
  const code = (error as AuthError | undefined)?.code ?? '';
  switch (code) {
    case 'auth/invalid-phone-number':
      return 'That phone number looks invalid. Check the number and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts from this device. Wait a few minutes and try again.';
    case 'auth/code-expired':
      return 'That code expired. Request a new one.';
    case 'auth/invalid-verification-code':
      return 'That code is incorrect. Check it and try again.';
    case 'auth/missing-verification-code':
      return 'Enter the 6-digit code.';
    case 'auth/credential-already-in-use':
    case 'auth/account-exists-with-different-credential':
      return 'That phone number or Google account is already linked to another wbill account.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return '';
    case 'auth/network-request-failed':
      return 'Network error — check your connection and try again.';
    case 'auth/requires-recent-login':
      return "For your security, please verify it's you again before this.";
    case 'auth/operation-not-allowed':
      return 'This sign-in method isn’t enabled yet. Please use your phone number, or try again later.';
    case 'auth/unauthorized-domain':
      return 'Sign-in isn’t enabled for this website address yet. Please try again later.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.';
    case 'auth/quota-exceeded':
      return "We've hit today's SMS limit. Try again later or use Google sign-in.";
    default:
      return 'Something went wrong. Please try again.';
  }
}

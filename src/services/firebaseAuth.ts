import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebase.js';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
    recaptchaWidgetId?: any;
    grecaptcha?: any;
  }
}

/**
 * Initializes Firebase RecaptchaVerifier (invisible or widget mode)
 */
export function setupRecaptcha(
  buttonOrContainerId: string = 'sign-in-button',
  size: 'invisible' | 'normal' = 'invisible',
  onSolved?: () => void
): RecaptchaVerifier {
  // Clear any existing verifier if present to avoid DOM collision
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {}
    window.recaptchaVerifier = undefined;
  }

  const verifier = new RecaptchaVerifier(auth, buttonOrContainerId, {
    size,
    callback: () => {
      console.log('[Firebase Auth] reCAPTCHA verified successfully');
      if (onSolved) onSolved();
    },
    'expired-callback': () => {
      console.warn('[Firebase Auth] reCAPTCHA expired, user must retry');
    },
  });

  window.recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Resets the reCAPTCHA widget in case of an SMS failure
 */
export async function resetRecaptcha(): Promise<void> {
  if (window.recaptchaVerifier) {
    try {
      if (window.recaptchaWidgetId !== undefined && window.grecaptcha?.reset) {
        window.grecaptcha.reset(window.recaptchaWidgetId);
      } else {
        const widgetId = await window.recaptchaVerifier.render();
        window.recaptchaWidgetId = widgetId;
        if (window.grecaptcha?.reset) {
          window.grecaptcha.reset(widgetId);
        }
      }
    } catch (err) {
      console.warn('[Firebase Auth] Error resetting reCAPTCHA:', err);
    }
  }
}

/**
 * Sends a real verification code via Firebase Phone Auth & SMS
 */
export async function sendFirebasePhoneOtp(
  phoneNumber: string,
  verifier?: RecaptchaVerifier
): Promise<ConfirmationResult> {
  const appVerifier = verifier || window.recaptchaVerifier;
  if (!appVerifier) {
    throw new Error('reCAPTCHA verifier is not initialized');
  }

  // Ensure E.164 format (+91XXXXXXXXXX)
  const cleanDigits = phoneNumber.replace(/\D/g, '');
  const e164 = cleanDigits.startsWith('91')
    ? `+${cleanDigits}`
    : `+91${cleanDigits.slice(-10)}`;

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, e164, appVerifier);
    window.confirmationResult = confirmationResult;
    console.log('[Firebase Auth] Verification SMS sent to', e164);
    return confirmationResult;
  } catch (error: any) {
    await resetRecaptcha();
    if (error?.code === 'auth/billing-not-enabled') {
      console.warn('[Firebase Auth] Project is on Spark (free) plan. Real SMS requires Blaze billing or Firebase test numbers.');
    } else {
      console.warn('[Firebase Auth] signInWithPhoneNumber notice:', error?.message || error);
    }
    throw error;
  }
}

/**
 * Confirms OTP code with Firebase ConfirmationResult
 */
export async function confirmFirebasePhoneOtp(
  code: string,
  customConfirmationResult?: ConfirmationResult
): Promise<FirebaseUser> {
  const confirmation = customConfirmationResult || window.confirmationResult;
  if (!confirmation) {
    throw new Error('No active verification session found. Please request OTP again.');
  }

  const result = await confirmation.confirm(code.trim());
  console.log('[Firebase Auth] User signed in successfully via Firebase Phone Auth:', result.user.uid);
  return result.user;
}

/**
 * Signs out the current Firebase user
 */
export async function firebaseSignOut(): Promise<void> {
  try {
    await signOut(auth);
    window.confirmationResult = undefined;
    console.log('[Firebase Auth] User signed out from Firebase');
  } catch (err) {
    console.warn('[Firebase Auth] Error signing out from Firebase:', err);
  }
}

/**
 * Observer for Firebase Auth state changes
 */
export function onAuthObserver(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

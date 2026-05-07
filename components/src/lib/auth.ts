import { api } from "@/lib/api";
import type { User } from "@/data/seed";
import {
  isLocked,
  trackFailedAttempt,
  clearAttempts,
  getRemainingAttempts,
  getTimeUntilUnlocked,
  formatTimeRemaining,
  resetLockout,
} from "@/lib/admin-attempt-tracker";

// minimal store using plain event emitter pattern
type Listener = () => void;
let _user: User | null = null;
let _loading = true;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

export function getUser() { return _user; }
export function isLoading() { return _loading; }

export async function refreshUser() {
  _loading = true; emit();
  _user = await api.me();
  _loading = false; emit();
}

export async function signInMock(admin = false) {
  _user = await api.mockGoogleSignIn(admin);
  emit();
}

export async function requestOtp(phone: string) {
  await api.requestOtp(phone);
}

export async function signInWithOtp(phone: string, otp: string, name?: string) {
  _user = await api.verifyOtp({ phone, otp, name });
  emit();
}

export async function signInAdmin(email: string, password: string) {
  // Check if account is locked
  if (isLocked(email)) {
    const timeRemaining = getTimeUntilUnlocked(email);
    throw new Error(
      `Account locked. Try again in ${formatTimeRemaining(timeRemaining)}`
    );
  }

  try {
    _user = await api.adminPasswordSignIn(email, password);
    // Clear attempts on successful login
    clearAttempts(email);
    emit();
  } catch (error) {
    // Track failed attempt
    trackFailedAttempt(email);
    const remaining = getRemainingAttempts(email);

    if (remaining === 0) {
      const timeRemaining = getTimeUntilUnlocked(email);
      throw new Error(
        `Invalid password. Account locked for ${formatTimeRemaining(timeRemaining)}`
      );
    } else if (remaining === 1) {
      throw new Error(
        `Invalid password. 1 attempt remaining before lockout`
      );
    } else {
      throw new Error(
        `Invalid password. ${remaining} attempts remaining`
      );
    }
  }
}

export async function signOut() {
  await api.logout();
  _user = null;
  emit();
}

export function subscribe(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

// Export attempt tracking functions for use in components
export { getRemainingAttempts, getTimeUntilUnlocked, resetLockout } from "@/lib/admin-attempt-tracker";

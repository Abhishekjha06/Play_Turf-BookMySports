import { api } from "@/lib/api";
import type { User } from "@/data/seed";

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

export async function signInAdmin(email: string, password: string) {
  _user = await api.adminPasswordSignIn(email, password);
  emit();
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

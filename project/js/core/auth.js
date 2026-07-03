import { auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { bus } from "./event-bus.js";

export let currentUser = null;

export function initAuthListener() {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    bus.emit("auth:changed", user);
  });
}

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signup(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(cred.user, { displayName: name });
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}

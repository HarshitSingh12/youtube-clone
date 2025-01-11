import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAF0Cm1itVYf7j9oHDtrGv9fEukjAJ3aYA",
  authDomain: "yt-clone-480e6.firebaseapp.com",
  projectId: "yt-clone-480e6",
  appId: "1:1000078528781:web:a73041be42d80191f86044",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export const functions = getFunctions(app);

export function signInWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export function signOut() {
  return auth.signOut();
}

export function onAuthStateChangedHelper(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, callback);
}

"use client";

import { signInWithGoogle, signOut } from "../firebase/firebase";
import styles from "./signIn.module.css";
import { User } from "firebase/auth";

interface signInProps {
  user: User | null;
}

export default function signIn({ user }: signInProps) {
  return (
    <div>
      {user ? (
        <button className={styles.signin} onClick={signOut}>
          Sign Out
        </button>
      ) : (
        <button className={styles.signin} onClick={signInWithGoogle}>
          Sign In
        </button>
      )}
    </div>
  );
}

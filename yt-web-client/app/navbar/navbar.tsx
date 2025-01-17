"use client";

import SignIn from "./signIn";
import Image from "next/image";
import Link from "next/link";

import { User } from "firebase/auth";
import { useState, useEffect } from "react";
import { onAuthStateChangedHelper } from "../firebase/firebase";

import styles from "./navbar.module.css";
import Upload from "./upload";

function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <nav className={styles.nav}>
      <Link href="/">
        <Image
          width={90}
          height={20}
          src="/youtube-logo.svg"
          alt="YouTube Logo"
        />
      </Link>
      {user && <Upload />}
      <SignIn user={user} />
    </nav>
  );
}

export default Navbar;

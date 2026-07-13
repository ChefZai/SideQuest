import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import type { UserProfile } from "../types/domain";

export const observeAuth = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

export async function createAccount(
  email: string,
  password: string,
  displayName: string,
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await setDoc(doc(db, "users", credential.user.uid), {
    displayName,
    email,
    photoUrl: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return credential.user;
}

export async function signIn(email: string, password: string) {
  return (await signInWithEmailAndPassword(auth, email, password)).user;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const credential = await signInWithPopup(auth, provider);
  const user = credential.user;

  await setDoc(
    doc(db, "users", user.uid),
    {
      displayName:
        user.displayName || user.email?.split("@")[0] || "Explorer",
      email: user.email || "",
      photoUrl: user.photoURL || null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return user;
}

export async function signOutUser() {
  await signOut(auth);
}

export async function getUserProfile(user: User): Promise<UserProfile> {
  const data = (await getDoc(doc(db, "users", user.uid))).data();
  return {
    id: user.uid,
    displayName:
      data?.displayName ||
      user.displayName ||
      user.email?.split("@")[0] ||
      "Explorer",
    email: user.email || "",
    photoUrl: data?.photoUrl || user.photoURL || null,
  };
}

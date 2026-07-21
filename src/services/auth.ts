import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import type { OnboardingState, UserProfile } from "../types/domain";
import { CURRENT_ONBOARDING_VERSION, normalizeOnboardingState } from "../v2/onboarding-state";

export const NEW_USER_ONBOARDING: OnboardingState = {
  started: false,
  step: "welcome",
  completed: false,
  dismissedTips: [],
  version: CURRENT_ONBOARDING_VERSION,
};

export const LEGACY_USER_ONBOARDING: OnboardingState = {
  started: true,
  step: "complete",
  completed: true,
  dismissedTips: [],
};

export const observeAuth = (
  callback: (user: User | null) => void,
  error?: (error: Error) => void,
) => onAuthStateChanged(auth, callback, error);

export async function createAccount(
  email: string,
  password: string,
  displayName: string,
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  try {
    await updateProfile(credential.user, { displayName });
    await setDoc(doc(db, "users", credential.user.uid), {
      displayName,
      email,
      photoUrl: null,
      onboarding: NEW_USER_ONBOARDING,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return credential.user;
  } catch (error) {
    try {
      await deleteUser(credential.user);
    } catch {
      // If rollback fails, the next sign-in can still repair the missing profile.
    }
    throw error;
  }
}

export async function resetPassword(email: string) {
  if (!email.trim()) throw new Error("Enter your email address first.");
  await sendPasswordResetEmail(auth, email.trim());
}

export async function signIn(email: string, password: string) {
  return (await signInWithEmailAndPassword(auth, email, password)).user;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const credential = await signInWithPopup(auth, provider);
  const user = credential.user;
  const isNewUser = getAdditionalUserInfo(credential)?.isNewUser === true;

  await setDoc(
    doc(db, "users", user.uid),
    {
      displayName: user.displayName || user.email?.split("@")[0] || "Explorer",
      email: user.email || "",
      photoUrl: user.photoURL || null,
      ...(isNewUser
        ? { onboarding: NEW_USER_ONBOARDING, createdAt: serverTimestamp() }
        : {}),
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
  const savedOnboarding = data?.onboarding;

  return {
    id: user.uid,
    displayName:
      data?.displayName ||
      user.displayName ||
      user.email?.split("@")[0] ||
      "Explorer",
    email: user.email || "",
    photoUrl: data?.photoUrl || user.photoURL || null,
    onboarding: normalizeOnboardingState(savedOnboarding, LEGACY_USER_ONBOARDING),
  };
}

export async function updateUserOnboarding(
  uid: string,
  onboarding: OnboardingState,
) {
  await setDoc(
    doc(db, "users", uid),
    { onboarding, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
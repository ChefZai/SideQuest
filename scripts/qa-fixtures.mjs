import { initializeApp } from "firebase/app";
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { connectFirestoreEmulator, doc, getFirestore, setDoc, Timestamp } from "firebase/firestore";

const projectId = "sidequest-2e798";
const password = "SideQuest-QA-2026!";
const accounts = {
  newUser: "qa-new@sidequest.local",
  owner: "qa-owner@sidequest.local",
  member: "qa-member@sidequest.local",
};

const assertLocal = () => {
  if (!/^127\.0\.0\.1$|^localhost$/.test(process.env.FIRESTORE_EMULATOR_HOST?.split(":")[0] || "127.0.0.1")) {
    throw new Error("QA fixtures may run only against local emulators.");
  }
};

async function reset() {
  assertLocal();
  await Promise.all([
    fetch(`http://127.0.0.1:8085/emulator/v1/projects/${projectId}/databases/(default)/documents`, { method: "DELETE" }),
    fetch(`http://127.0.0.1:9099/emulator/v1/projects/${projectId}/accounts`, { method: "DELETE" }),
  ]);
  console.log("SideQuest QA fixtures reset.");
}

const onboarding = { started: true, step: "complete", completed: true, dismissedTips: [], version: 3, productTourVersion: "v5_6_editorial" };
const now = Timestamp.fromDate(new Date("2026-08-01T12:00:00Z"));
const later = Timestamp.fromDate(new Date("2026-08-05T12:00:00Z"));

async function account(auth, db, email, name, completed = true) {
  let user;
  try { user = (await createUserWithEmailAndPassword(auth, email, password)).user; }
  catch { user = (await signInWithEmailAndPassword(auth, email, password)).user; }
  await setDoc(doc(db, "users", user.uid), { displayName: name, email, photoUrl: null, onboarding: completed ? onboarding : { ...onboarding, started: false, step: "welcome", completed: false }, createdAt: now, updatedAt: later });
  return user;
}

const baseSpace = (ownerId, memberIds, memberNames, name) => ({
  ownerId, adminIds: [], memberIds, memberNames, name, emoji: "🌤️", type: "custom",
  categories: [{ id: "adventure", emoji: "🥾", label: "Adventure", accent: "32,181,155" }, { id: "books", emoji: "📚", label: "Books", accent: "196,132,104" }],
  reactionDefs: [{ type: "love", emoji: "❤️", label: "Love this" }, { type: "interested", emoji: "✨", label: "Interested" }],
  templateId: "blank", templateVersion: 1, accentTheme: "teal", starterPackApplied: false, createdAt: now, updatedAt: later,
});

const quest = (spaceId, createdBy, id, patch = {}) => ({
  spaceId, title: `QA Quest ${id}`, description: "A deterministic Quest used only by the local SideQuest QA environment.", category: "Adventure", categoryEmoji: "🥾",
  tags: [], price: "", duration: "", location: "", placeId: "", latitude: null, longitude: null, mapsUrl: "", photoUrl: "", createdBy, createdByName: "QA Owner",
  completed: false, questType: "experience", status: "planning", templateId: "custom", templateVersion: 1, templateData: {}, relatedQuestIds: [], createdAt: now, updatedAt: later, ...patch,
});

async function seed() {
  assertLocal();
  const app = initializeApp({ apiKey: "qa", projectId, authDomain: "localhost", storageBucket: `${projectId}.appspot.com` });
  const auth = getAuth(app); connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  const db = getFirestore(app); connectFirestoreEmulator(db, "127.0.0.1", 8085);
  const fresh = await account(auth, db, accounts.newUser, "QA New User", false);
  await signOut(auth);
  const owner = await account(auth, db, accounts.owner, "QA Owner");
  await signOut(auth);
  const member = await account(auth, db, accounts.member, "QA Member");
  await signOut(auth);
  await signInWithEmailAndPassword(auth, accounts.owner, password);
  const memberIds = [owner.uid, member.uid], memberNames = { [owner.uid]: "QA Owner", [member.uid]: "QA Member" };
  const spaceNames = { "first-use": "QA First Use", populated: "QA Populated", shared: "QA Shared", "edge-case": "QA Edge Cases" };
  for (const id of ["first-use", "populated", "shared", "edge-case"]) await setDoc(doc(db, "spaces", `qa-${id}`), baseSpace(owner.uid, id === "shared" ? memberIds : [owner.uid], id === "shared" ? memberNames : { [owner.uid]: "QA Owner" }, spaceNames[id]));
  await setDoc(doc(db, "ideas", "qa-first-quest"), quest("qa-first-use", owner.uid, "first-quest"));
  await setDoc(doc(db, "ideas", "qa-standard"), quest("qa-populated", owner.uid, "standard", { photoUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80" }));
  await setDoc(doc(db, "ideas", "qa-goal"), quest("qa-populated", owner.uid, "goal", { title: "Read 50 books", category: "Books", categoryEmoji: "📚", questType: "goal", goalCurrent: 17, goalTarget: 50, goalUnit: "books" }));
  await setDoc(doc(db, "ideas", "qa-memory"), quest("qa-populated", owner.uid, "memory", { title: "Sunrise above the valley", completed: true, status: "completed", completedAt: later, photoUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80" }));
  await setDoc(doc(db, "ideas", "qa-collection"), quest("qa-populated", owner.uid, "collection", { title: "National Parks", questType: "collection", chapterMode: false }));
  await setDoc(doc(db, "ideas", "qa-chapter"), quest("qa-populated", owner.uid, "chapter", { title: "Summer 2026", questType: "collection", chapterMode: true }));
  await setDoc(doc(db, "ideas", "qa-shared"), quest("qa-shared", owner.uid, "shared", { title: "Weekend by the lake" }));
  await setDoc(doc(db, "ideas", "qa-edge"), { spaceId: "qa-edge-case", title: "A very long Quest title with emoji 🌍✨ and 日本語 that safely wraps across several lines without breaking the experience", description: "Long content\n".repeat(30), category: "Adventure", categoryEmoji: "🥾", photoUrl: "https://invalid.sidequest.local/broken-image.jpg", createdBy: owner.uid, createdByName: "QA Owner", completed: false, tags: ["one", 2, null], createdAt: now });
  await setDoc(doc(db, "activity", "qa-milestone"), { spaceId: "qa-populated", targetId: "qa-standard", questId: "qa-standard", actorId: owner.uid, actorName: "QA Owner", action: "milestone-added", momentType: "milestone-added", title: "Booked the cabin", isMilestone: true, milestoneId: "qa-milestone", milestoneStatus: "upcoming", emoji: "🏕️", createdAt: later });
  await setDoc(doc(db, "memories", "qa-memory"), { ideaId: "qa-memory", spaceId: "qa-populated", actualCost: "", photoUrls: [], completedBy: owner.uid, createdAt: later, updatedAt: later });
  await signOut(auth);
  await signInWithEmailAndPassword(auth, accounts.member, password);
  await setDoc(doc(db, "ideas", "qa-shared", "reactions", member.uid), { userId: member.uid, userName: "QA Member", type: "love", updatedAt: later });
  await setDoc(doc(db, "ideas", "qa-shared", "comments", "qa-comment"), { authorId: member.uid, authorName: "QA Member", text: "This feels like the right weekend.", createdAt: later });
  await signOut(auth);
  console.log(`Seeded local QA fixtures.\nOwner: ${accounts.owner}\nMember: ${accounts.member}\nNew user: ${accounts.newUser}\nPassword: ${password}\nUnused new-user uid: ${fresh.uid}`);
}

const command = process.argv[2];
if (command === "reset") await reset();
else if (command === "seed") await seed();
else throw new Error("Use: node scripts/qa-fixtures.mjs seed|reset");

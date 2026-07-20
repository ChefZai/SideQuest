import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  Timestamp,
  arrayUnion,
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

const projectId = "sidequest-2e798";
const ownerId = "owner";
const adminId = "admin";
const memberId = "member";
const inviteeId = "invitee";
const outsiderId = "outsider";
const spaceId = "space-one";
const inviteCode = "VALIDINVITE1";
let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId,
    firestore: { rules: await readFile("firestore.rules", "utf8") },
    storage: { rules: await readFile("storage.rules", "utf8") },
  });

  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db, "spaces", spaceId), {
      name: "Private Space",
      emoji: "✨",
      type: "Together",
      ownerId,
      adminIds: [adminId],
      memberIds: [ownerId, adminId, memberId],
      memberNames: { [ownerId]: "Owner", [adminId]: "Admin", [memberId]: "Member" },
      categories: [],
      reactionDefs: [],
      deletedAt: null,
      updatedAt: Timestamp.now(),
    });
    await setDoc(doc(db, "invitations", inviteCode), {
      code: inviteCode,
      spaceId,
      spaceName: "Private Space",
      spaceEmoji: "✨",
      invitedBy: ownerId,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromMillis(Date.now() + 60 * 60 * 1000),
    });
    await setDoc(doc(db, "ideas", "idea-one"), {
      spaceId,
      title: "Private Idea",
      createdBy: ownerId,
      createdByName: "Owner",
      completed: false,
      completedAt: null,
    });
  });
});

after(async () => {
  await env?.cleanup();
});

test("outsiders cannot read a Space or enumerate invitations", async () => {
  const db = env.authenticatedContext(outsiderId).firestore();
  await assertFails(getDoc(doc(db, "spaces", spaceId)));
  await assertFails(getDocs(collection(db, "invitations")));
});

test("members can use the live array-contains Space query", async () => {
  const db = env.authenticatedContext(memberId).firestore();
  const snapshot = await assertSucceeds(
    getDocs(query(collection(db, "spaces"), where("memberIds", "array-contains", memberId))),
  );
  assert.equal(snapshot.docs.length, 1);
  assert.equal(snapshot.docs[0].id, spaceId);
});

test("members can synchronize only their own display name", async () => {
  const db = env.authenticatedContext(memberId).firestore();
  await assertSucceeds(updateDoc(doc(db, "spaces", spaceId), {
    ["memberNames." + memberId]: "Maya",
    updatedAt: Timestamp.now(),
  }));
  await assertFails(updateDoc(doc(db, "spaces", spaceId), {
    ["memberNames." + ownerId]: "Not the owner",
    updatedAt: Timestamp.now(),
  }));
});

test("a signed-in invitee can read only a known valid invite", async () => {
  const db = env.authenticatedContext(inviteeId).firestore();
  const invite = await assertSucceeds(getDoc(doc(db, "invitations", inviteCode)));
  assert.equal(invite.data().spaceId, spaceId);
});

test("an invitee cannot add themselves without an atomic valid claim", async () => {
  const db = env.authenticatedContext(inviteeId).firestore();
  await assertFails(updateDoc(doc(db, "spaces", spaceId), {
    memberIds: arrayUnion(inviteeId),
    ["memberNames." + inviteeId]: "Invitee",
  }));
});

test("a valid invite claim and membership update succeed atomically", async () => {
  const db = env.authenticatedContext(inviteeId).firestore();
  const batch = writeBatch(db);
  batch.set(doc(db, "spaces", spaceId, "joinClaims", inviteeId), {
    uid: inviteeId,
    code: inviteCode,
    createdAt: Timestamp.now(),
  });
  batch.update(doc(db, "spaces", spaceId), {
    memberIds: arrayUnion(inviteeId),
    ["memberNames." + inviteeId]: "Invitee",
    updatedAt: Timestamp.now(),
  });
  await assertSucceeds(batch.commit());
});

test("admins can personalize but cannot take ownership or alter membership", async () => {
  const db = env.authenticatedContext(adminId).firestore();
  await assertSucceeds(updateDoc(doc(db, "spaces", spaceId), {
    name: "Renamed Together",
    updatedAt: Timestamp.now(),
  }));
  await assertFails(updateDoc(doc(db, "spaces", spaceId), {
    ownerId: adminId,
    updatedAt: Timestamp.now(),
  }));
  await assertFails(updateDoc(doc(db, "spaces", spaceId), {
    memberIds: arrayUnion(outsiderId),
    updatedAt: Timestamp.now(),
  }));
});

test("members cannot rewrite Idea ownership, Space identity, or completion", async () => {
  const db = env.authenticatedContext(memberId).firestore();
  await assertFails(updateDoc(doc(db, "ideas", "idea-one"), { createdBy: memberId }));
  await assertFails(updateDoc(doc(db, "ideas", "idea-one"), { spaceId: "another-space" }));
  await assertFails(updateDoc(doc(db, "ideas", "idea-one"), { completed: true }));
});

test("the Space owner can complete an Idea", async () => {
  const db = env.authenticatedContext(ownerId).firestore();
  await assertSucceeds(updateDoc(doc(db, "ideas", "idea-one"), {
    completed: true,
    completedAt: Timestamp.now(),
  }));
});

test("onboarding state is private to its user", async () => {
  const ownerDb = env.authenticatedContext(ownerId).firestore();
  const outsiderDb = env.authenticatedContext(outsiderId).firestore();
  const profile = {
    displayName: "Owner",
    onboarding: {
      started: true,
      step: "idea",
      completed: false,
      dismissedTips: ["map"],
    },
    updatedAt: Timestamp.now(),
  };
  await assertSucceeds(setDoc(doc(ownerDb, "users", ownerId), profile));
  await assertSucceeds(getDoc(doc(ownerDb, "users", ownerId)));
  await assertFails(getDoc(doc(outsiderDb, "users", ownerId)));
  await assertFails(updateDoc(doc(outsiderDb, "users", ownerId), {
    onboarding: { ...profile.onboarding, completed: true },
  }));
});
test("Storage allows members and blocks outsiders", async () => {
  const memberStorage = env.authenticatedContext(memberId).storage();
  const outsiderStorage = env.authenticatedContext(outsiderId).storage();
  const path = "spaces/" + spaceId + "/ideas/idea-one/" + memberId + "/photo.jpg";
  const image = new Uint8Array([255, 216, 255, 217]);
  await assertSucceeds(uploadBytes(ref(memberStorage, path), image, { contentType: "image/jpeg" }));
  await assertSucceeds(getDownloadURL(ref(memberStorage, path)));
  await assertFails(getDownloadURL(ref(outsiderStorage, path)));
});

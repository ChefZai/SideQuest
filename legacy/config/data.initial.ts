import { addDoc, arrayUnion, collection, deleteDoc, doc, getDocs, limit, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where, type Unsubscribe } from "firebase/firestore";
import { db } from "../firebase";
import type { ActivityRecord, CommentRecord, IdeaRecord, InvitationRecord, ReactionRecord, SpaceRecord } from "../types/domain";

const withId = <T>(snapshot: { id: string; data: () => unknown }) => ({ id: snapshot.id, ...(snapshot.data() as object) }) as T;

export function observeSpaces(userId: string, callback: (spaces: SpaceRecord[]) => void, onError: (error: Error) => void): Unsubscribe {
  return onSnapshot(query(collection(db, "spaces"), where("memberIds", "array-contains", userId)), snapshot => {
    const spaces = snapshot.docs.map(item => withId<SpaceRecord>(item));
    spaces.sort((a, b) => (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0));
    callback(spaces);
  }, onError);
}
export async function createSpace(input: Omit<SpaceRecord, "id" | "createdAt" | "updatedAt">) { return addDoc(collection(db, "spaces"), { ...input, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }); }
export function observeIdeas(spaceId: string, callback: (ideas: IdeaRecord[]) => void, onError: (error: Error) => void): Unsubscribe {
  return onSnapshot(query(collection(db, "ideas"), where("spaceId", "==", spaceId)), snapshot => {
    const ideas = snapshot.docs.map(item => withId<IdeaRecord>(item));
    ideas.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    callback(ideas);
  }, onError);
}
export async function createIdea(input: Omit<IdeaRecord, "id" | "createdAt" | "updatedAt">) { return addDoc(collection(db, "ideas"), { ...input, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }); }
export async function updateIdea(ideaId: string, patch: Partial<IdeaRecord>) { await updateDoc(doc(db, "ideas", ideaId), { ...patch, updatedAt: serverTimestamp() }); }
export async function removeIdea(ideaId: string) { await deleteDoc(doc(db, "ideas", ideaId)); }
export async function setReaction(ideaId: string, reaction: ReactionRecord | null, userId: string) {
  const reference = doc(db, "ideas", ideaId, "reactions", userId);
  if (!reaction) return deleteDoc(reference);
  return setDoc(reference, { ...reaction, updatedAt: serverTimestamp() });
}
export function observeReactions(ideaId: string, callback: (items: ReactionRecord[]) => void): Unsubscribe { return onSnapshot(collection(db, "ideas", ideaId, "reactions"), snapshot => callback(snapshot.docs.map(item => withId<ReactionRecord>(item)))); }
export async function addComment(ideaId: string, input: Omit<CommentRecord, "id" | "createdAt">) { return addDoc(collection(db, "ideas", ideaId, "comments"), { ...input, createdAt: serverTimestamp() }); }
export function observeComments(ideaId: string, callback: (items: CommentRecord[]) => void): Unsubscribe {
  return onSnapshot(collection(db, "ideas", ideaId, "comments"), snapshot => {
    const items = snapshot.docs.map(item => withId<CommentRecord>(item));
    items.sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
    callback(items);
  });
}
export async function recordActivity(input: Omit<ActivityRecord, "id" | "createdAt">) { return addDoc(collection(db, "activity"), { ...input, createdAt: serverTimestamp() }); }
export function observeActivity(spaceIds: string[], callback: (items: ActivityRecord[]) => void): Unsubscribe {
  if (!spaceIds.length) { callback([]); return () => undefined; }
  return onSnapshot(query(collection(db, "activity"), where("spaceId", "in", spaceIds.slice(0, 10)), limit(50)), snapshot => {
    const items = snapshot.docs.map(item => withId<ActivityRecord>(item));
    items.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    callback(items);
  });
}
export async function createInvitation(space: SpaceRecord, invitedBy: string): Promise<InvitationRecord> {
  const code = crypto.randomUUID().slice(0, 8).toUpperCase();
  const result = await addDoc(collection(db, "invitations"), { code, spaceId: space.id, spaceName: space.name, spaceEmoji: space.emoji, invitedBy, createdAt: serverTimestamp() });
  return { id: result.id, code, spaceId: space.id, spaceName: space.name, spaceEmoji: space.emoji, invitedBy };
}
export async function joinSpaceByCode(code: string, userId: string) {
  const result = await getDocs(query(collection(db, "invitations"), where("code", "==", code.trim().toUpperCase()), limit(1)));
  if (result.empty) throw new Error("That invitation code was not found.");
  const invitation = withId<InvitationRecord>(result.docs[0]);
  await updateDoc(doc(db, "spaces", invitation.spaceId), { memberIds: arrayUnion(userId), updatedAt: serverTimestamp() });
  return invitation.spaceId;
}

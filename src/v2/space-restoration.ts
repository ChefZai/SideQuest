import type { Space } from "./domain";

const key = (userId: string) => `sidequest:selected-space:${userId}`;
const lastKey = "sidequest:last-accessible-space";

export function restoredSpaceId(userId: string): string {
  try { return localStorage.getItem(key(userId)) || ""; } catch { return ""; }
}

export function rememberSpaceId(userId: string, spaceId: string): void {
  try { if (spaceId) localStorage.setItem(key(userId), spaceId); else localStorage.removeItem(key(userId)); } catch { /* Persistence is optional. */ }
}

export function resolveAccessibleSpaceId(spaces: readonly Space[], currentId: string, preferredId = ""): string {
  const active = spaces.filter(space => !space.deletedAt);
  if (currentId && active.some(space => space.id === currentId)) return currentId;
  if (preferredId && active.some(space => space.id === preferredId)) return preferredId;
  return active[0]?.id || "";
}

export function lastAccessibleSpaceId(): string {
  try { return localStorage.getItem(lastKey) || ""; } catch { return ""; }
}

export function rememberLastAccessibleSpace(spaceId: string): void {
  try { if (spaceId) localStorage.setItem(lastKey, spaceId); } catch { /* Persistence is optional. */ }
}

export function prioritizeRestoredSpace(spaces: readonly Space[]): Space[] {
  const preferred = lastAccessibleSpaceId();
  return [...spaces].sort((left, right) => left.id === preferred ? -1 : right.id === preferred ? 1 : 0);
}

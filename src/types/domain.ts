import type { Timestamp } from "firebase/firestore";
export interface CategoryDefinition { id: string; emoji: string; label: string; accent: string; }
export interface ReactionDefinition { type: string; emoji: string; label: string; }
export interface UserProfile { id: string; displayName: string; email: string; photoUrl: string | null; }
export interface SpaceRecord { id: string; name: string; emoji: string; type: string; ownerId: string; memberIds: string[]; categories: CategoryDefinition[]; reactionDefs: ReactionDefinition[]; createdAt?: Timestamp; updatedAt?: Timestamp; }
export interface IdeaRecord { id: string; spaceId: string; title: string; category: string; categoryEmoji: string; accent: string; description: string; location: string; tags: string[]; photoUrl: string; createdBy: string; createdByName: string; completed: boolean; completedAt?: Timestamp | null; createdAt?: Timestamp; updatedAt?: Timestamp; }
export interface CommentRecord { id: string; authorId: string; authorName: string; text: string; createdAt?: Timestamp; }
export interface ReactionRecord { userId: string; userName: string; type: string; updatedAt?: Timestamp; }
export interface ActivityRecord { id: string; spaceId: string; actorId: string; actorName: string; action: string; targetId: string; targetTitle: string; createdAt?: Timestamp; }
export interface InvitationRecord { id: string; code: string; spaceId: string; spaceName: string; spaceEmoji: string; invitedBy: string; createdAt?: Timestamp; expiresAt?: Timestamp; }


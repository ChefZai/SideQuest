import type { Timestamp } from "firebase/firestore";
import type { AccentTheme, IdeaTemplateData, IdeaTemplateId, SpaceTemplateId } from "../features/templates/templateTypes";
export interface CategoryDefinition { id: string; emoji: string; label: string; accent: string; }
export interface ReactionDefinition { type: string; emoji: string; label: string; }
export type OnboardingStep = "welcome" | "space" | "invite" | "invited" | "idea" | "success" | "complete";
export interface OnboardingState { started: boolean; step: OnboardingStep; completed: boolean; dismissedTips: string[]; replaying?: boolean; firstIdeaId?: string; version?: number; }
export interface UserProfile { id: string; displayName: string; email: string; photoUrl: string | null; onboarding: OnboardingState; }
export interface SpaceRecord { id: string; name: string; emoji: string; type: string; ownerId: string; memberIds: string[]; categories: CategoryDefinition[]; reactionDefs: ReactionDefinition[]; templateId?: SpaceTemplateId; templateVersion?: number; accentTheme?: AccentTheme; starterPackApplied?: boolean; starterIdeasApplied?: boolean; createdAt?: Timestamp; updatedAt?: Timestamp; }
export interface IdeaRecord { id: string; spaceId: string; title: string; category: string; categoryEmoji: string; accent: string; description: string; location: string; tags: string[]; photoUrl: string; createdBy: string; createdByName: string; completed: boolean; templateId?: IdeaTemplateId; templateVersion?: number; templateData?: IdeaTemplateData; starterId?: string; completedAt?: Timestamp | null; createdAt?: Timestamp; updatedAt?: Timestamp; }
export interface CommentRecord { id: string; authorId: string; authorName: string; text: string; createdAt?: Timestamp; }
export interface ReactionRecord { userId: string; userName: string; type: string; updatedAt?: Timestamp; }
export interface ActivityRecord { id: string; spaceId: string; actorId: string; actorName: string; action: string; targetId: string; targetTitle: string; createdAt?: Timestamp; }
export interface InvitationRecord { id: string; code: string; spaceId: string; spaceName: string; spaceEmoji: string; invitedBy: string; createdAt?: Timestamp; expiresAt?: Timestamp; }


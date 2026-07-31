import type { ActivityItem, Idea, ReactionDef, Space } from "../../v2/domain";
import { resolveQuestStatus, type QuestStatus, type QuestType } from "../quests/questTypes";

export type QuestLifecycle = "saved" | "shared" | "making-it-happen" | "remembered";
export type CaptureSourceType = "title" | "url" | "photo" | "shared";
export interface CaptureInput { title?: string; url?: string; text?: string; image?: File | null; sourceApp?: string }
export interface NormalizedCaptureInput { title: string; url: string; text: string; image: File | null; sourceApp: string; sourceType: CaptureSourceType }

export const QUICK_CAPTURE_DEFAULTS: { questType: QuestType; status: QuestStatus } = {
  questType: "experience",
  status: "inspired",
};

export function normalizeCaptureInput(input: CaptureInput): NormalizedCaptureInput {
  const url = typeof input.url === "string" ? input.url.trim() : "";
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const text = typeof input.text === "string" ? input.text.trim() : "";
  return {
    title: title || (url ? url : text.slice(0, 80)),
    url,
    text,
    image: input.image instanceof File ? input.image : null,
    sourceApp: typeof input.sourceApp === "string" ? input.sourceApp.trim().slice(0, 80) : "",
    sourceType: input.image ? "photo" : url ? "url" : input.sourceApp ? "shared" : "title",
  };
}

export function deriveQuestLifecycle(idea: Idea, space?: Space): QuestLifecycle {
  if (idea.completed || resolveQuestStatus(idea.status, idea.completed) === "completed") return "remembered";
  const status = resolveQuestStatus(idea.status, idea.completed);
  if (status === "planning" || status === "in-progress" || status === "paused") return "making-it-happen";
  if (space && space.memberIds.length > 1) return "shared";
  return "saved";
}

const positiveWords = ["love", "loved", "interested", "excited", "must", "yes", "down"];
export function isPositiveReaction(definition: ReactionDef): boolean {
  const value = `${definition.type} ${definition.label}`.toLowerCase();
  return positiveWords.some(word => value.includes(word));
}

export function mutualInterest(reactions: { userId: string; type: string }[], definitions: ReactionDef[]): boolean {
  const positive = new Set(definitions.filter(isPositiveReaction).map(item => item.type));
  return new Set(reactions.filter(item => positive.has(item.type)).map(item => item.userId)).size >= 2;
}

export function meaningfulHomeSections(ideas: Idea[], events: ActivityItem[], profileId: string) {
  const active = ideas.filter(item => !item.completed);
  const reactionEvents = events.filter(event => event.action.includes("react") || event.action.includes("love"));
  const positiveByQuest = new Map<string, Set<string>>();
  reactionEvents.forEach(event => {
    const id = event.questId || event.targetId;
    if (!positiveByQuest.has(id)) positiveByQuest.set(id, new Set());
    positiveByQuest.get(id)!.add(event.actorId);
  });
  return {
    sharedWithYou: active.filter(item => item.createdBy !== profileId).slice(0, 6),
    sharedExcitement: active.filter(item => (positiveByQuest.get(item.id)?.size || 0) >= 2).slice(0, 6),
    becomingReal: active.filter(item => deriveQuestLifecycle(item) === "making-it-happen" || events.some(event => (event.questId || event.targetId) === item.id && ["milestone-reached", "memory-added", "photo-added", "journey-resumed"].includes(event.action))).slice(0, 6),
    memory: ideas.find(item => item.completed),
  };
}

export const PRODUCT_ANALYTICS_EVENTS = {
  questSaved: "First Quest Saved",
  questShared: "Quest Shared",
  invitationAccepted: "Invitation Accepted",
  reactionAdded: "Reaction Added",
  mutualInterest: "Mutual Interest Detected",
  planningStarted: "Quest Entered Planning",
  questCompleted: "Quest Completed",
  reflectionAdded: "Completion Reflection Added",
  memoryViewed: "Memory Viewed",
  captureStarted: "Quick Capture Started",
  captureCompleted: "Quick Capture Completed",
  captureSource: "Capture Source Type",
} as const;


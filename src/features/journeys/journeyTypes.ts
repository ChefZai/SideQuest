import type { Timestamp } from "firebase/firestore";

export const MOMENT_TYPES = [
  "quest-created",
  "status-changed",
  "memory-added",
  "photo-added",
  "comment-added",
  "reaction-added",
  "milestone-reached",
  "quest-completed",
  "reflection-written",
  "invitation-accepted",
  "journey-started",
  "journey-resumed",
  "journey-paused",
  "journey-reopened",
  "journey-update",
] as const;

export type MomentType = (typeof MOMENT_TYPES)[number];
export type JourneyOrder = "newest" | "chronological";

export interface MomentRecord {
  id: string;
  spaceId: string;
  questId: string;
  actorId: string;
  actorName: string;
  type: MomentType;
  title: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  people?: string[];
  reactionCount?: number;
  isMilestone?: boolean;
  emoji?: string;
  celebrationColor?: string;
  createdAt?: Timestamp;
}

const LEGACY_ACTION_TYPES: Record<string, MomentType> = {
  added: "quest-created",
  created: "quest-created",
  updated: "journey-update",
  "changed status": "status-changed",
  completed: "quest-completed",
  joined: "invitation-accepted",
  commented: "comment-added",
};

const TITLES: Record<MomentType, string> = {
  "quest-created": "Created this Quest",
  "status-changed": "Changed the Journey status",
  "memory-added": "Added a memory",
  "photo-added": "Added a photo",
  "comment-added": "Shared a thought",
  "reaction-added": "Shared some excitement",
  "milestone-reached": "Reached a milestone",
  "quest-completed": "Completed this Journey",
  "reflection-written": "Wrote a reflection",
  "invitation-accepted": "Joined the Journey",
  "journey-started": "Started the Journey",
  "journey-resumed": "Resumed the Journey",
  "journey-paused": "Paused the Journey",
  "journey-reopened": "Reopened the Journey",
  "journey-update": "Added a Journey update",
};

export function resolveMomentType(value: unknown, legacyAction?: unknown): MomentType {
  if (typeof value === "string" && MOMENT_TYPES.includes(value as MomentType)) return value as MomentType;
  return typeof legacyAction === "string" ? LEGACY_ACTION_TYPES[legacyAction.toLowerCase()] ?? "journey-update" : "journey-update";
}

export function normalizeMoment(value: Record<string, unknown> & { id: string }): MomentRecord {
  const type = resolveMomentType(value.momentType ?? value.type, value.action);
  const legacyTarget = typeof value.targetId === "string" ? value.targetId : "";
  return {
    id: value.id,
    spaceId: typeof value.spaceId === "string" ? value.spaceId : "",
    questId: typeof value.questId === "string" ? value.questId : legacyTarget,
    actorId: typeof value.actorId === "string" ? value.actorId : "",
    actorName: typeof value.actorName === "string" && value.actorName.trim() ? value.actorName.trim() : "Someone",
    type,
    title: typeof value.title === "string" && value.title.trim() ? value.title.trim() : TITLES[type],
    description: typeof value.description === "string" && value.description.trim() ? value.description.trim() : undefined,
    imageUrl: typeof value.imageUrl === "string" && value.imageUrl.trim() ? value.imageUrl.trim() : undefined,
    location: typeof value.location === "string" && value.location.trim() ? value.location.trim() : undefined,
    people: Array.isArray(value.people) ? value.people.filter((item): item is string => typeof item === "string").slice(0, 12) : undefined,
    reactionCount: typeof value.reactionCount === "number" && Number.isFinite(value.reactionCount) ? Math.max(0, value.reactionCount) : undefined,
    isMilestone: value.isMilestone === true || type === "milestone-reached",
    emoji: typeof value.emoji === "string" && value.emoji.trim() ? value.emoji.trim().slice(0, 8) : undefined,
    celebrationColor: typeof value.celebrationColor === "string" && /^#[0-9a-f]{6}$/i.test(value.celebrationColor) ? value.celebrationColor : undefined,
    createdAt: value.createdAt as Timestamp | undefined,
  };
}

const stamp = (moment: MomentRecord) => moment.createdAt?.toMillis?.() ?? 0;

export function orderMoments(moments: MomentRecord[], order: JourneyOrder = "newest"): MomentRecord[] {
  return [...moments].sort((a, b) => order === "newest" ? stamp(b) - stamp(a) : stamp(a) - stamp(b));
}

export function journeySummary(moments: MomentRecord[], startedAt?: Timestamp, completed = false): string[] {
  const milestones = moments.filter(moment => moment.isMilestone).length;
  const latest = orderMoments(moments)[0];
  const lines: string[] = [];
  if (milestones) lines.push(`You've completed ${milestones} ${milestones === 1 ? "milestone" : "milestones"}.`);
  if (startedAt?.toMillis) {
    const days = Math.max(1, Math.floor((Date.now() - startedAt.toMillis()) / 86_400_000));
    lines.push(days < 30 ? `This Journey began ${days} ${days === 1 ? "day" : "days"} ago.` : `You've been shaping this Journey for ${Math.max(1, Math.floor(days / 30))} months.`);
  }
  if (latest?.createdAt?.toMillis) {
    const days = Math.floor((Date.now() - latest.createdAt.toMillis()) / 86_400_000);
    lines.push(days <= 0 ? "Last updated today." : days === 1 ? "Last updated yesterday." : `Last updated ${days} days ago.`);
  }
  if (completed) lines.push("This Journey now lives on as a Memory.");
  return lines;
}

export const JOURNEY_ANALYTICS_EVENT_NAMES = {
  started: "Journey Started",
  momentAdded: "Moment Added",
  milestoneAdded: "Milestone Added",
  memoryAdded: "Memory Added",
  reflectionWritten: "Reflection Written",
  continued: "Journey Continued",
  questCompleted: "Quest Completed",
  collectionUpdated: "Collection Updated",
} as const;

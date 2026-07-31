export const QUEST_TYPES = [
  "experience",
  "journey",
  "goal",
  "relationship",
  "collection",
  "lifestyle",
] as const;

export type QuestType = (typeof QUEST_TYPES)[number];

export const QUEST_STATUSES = [
  "inspired",
  "planning",
  "in-progress",
  "paused",
  "completed",
] as const;

export type QuestStatus = (typeof QUEST_STATUSES)[number];

export interface QuestMetadata {
  questType?: QuestType;
  status?: QuestStatus;
  collectionId?: string | null;
}

export interface QuestTypeDefinition {
  id: QuestType;
  label: string;
  emoji: string;
  description: string;
  accent: string;
}

export const QUEST_TYPE_DEFINITIONS: readonly QuestTypeDefinition[] = [
  { id: "experience", label: "Experience", emoji: "✨", description: "Something you want to see, try, or live.", accent: "var(--sq-peach, #ffb49a)" },
  { id: "journey", label: "Journey", emoji: "🧭", description: "A chapter that unfolds across time.", accent: "var(--sq-sky, #a9d9ef)" },
  { id: "goal", label: "Goal", emoji: "🌱", description: "A future you want to move toward.", accent: "var(--sq-yellow, #f1cf67)" },
  { id: "relationship", label: "Relationship", emoji: "🤝", description: "A way to grow closer and show up.", accent: "var(--sq-lavender, #b9afe8)" },
  { id: "collection", label: "Collection", emoji: "🗂️", description: "A home for possibilities that belong together.", accent: "var(--sq-teal, #20b59b)" },
  { id: "lifestyle", label: "Lifestyle", emoji: "☀️", description: "A rhythm or practice for everyday life.", accent: "var(--sq-success, #288a68)" },
];

export const QUEST_STATUS_LABELS: Record<QuestStatus, string> = {
  inspired: "Inspired",
  planning: "Planning",
  "in-progress": "In Progress",
  paused: "Paused",
  completed: "Completed Journey",
};

export const QUEST_ANALYTICS_EVENT_NAMES = {
  created: "Quest Created",
  viewed: "Quest Viewed",
  typeSelected: "Quest Type Selected",
  statusChanged: "Status Changed",
  collectionCreated: "Collection Created",
  journeyViewed: "Journey Viewed",
} as const;

export function resolveQuestType(value: unknown): QuestType {
  return typeof value === "string" && QUEST_TYPES.includes(value as QuestType)
    ? value as QuestType
    : "experience";
}

export function resolveQuestStatus(value: unknown, completed = false): QuestStatus {
  if (completed) return "completed";
  return typeof value === "string" && QUEST_STATUSES.includes(value as QuestStatus)
    ? value as QuestStatus
    : "planning";
}

export function questTypeDefinition(value: unknown): QuestTypeDefinition {
  const type = resolveQuestType(value);
  return QUEST_TYPE_DEFINITIONS.find(item => item.id === type) ?? QUEST_TYPE_DEFINITIONS[0];
}

export function normalizeQuestMetadata<T extends QuestMetadata & { completed?: boolean }>(value: T): T & Required<Pick<QuestMetadata, "questType" | "status">> {
  return {
    ...value,
    questType: resolveQuestType(value.questType),
    status: resolveQuestStatus(value.status, Boolean(value.completed)),
    collectionId: typeof value.collectionId === "string" && value.collectionId.trim()
      ? value.collectionId.trim()
      : null,
  };
}

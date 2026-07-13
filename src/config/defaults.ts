import type { CategoryDefinition, ReactionDefinition } from "../types/domain";
export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  { id: "food", emoji: "🍜", label: "Food", accent: "230,118,38" }, { id: "travel", emoji: "✈️", label: "Travel", accent: "40,110,220" },
  { id: "concert", emoji: "🎵", label: "Concert", accent: "148,68,220" }, { id: "adventure", emoji: "🏕️", label: "Adventure", accent: "60,148,90" },
  { id: "gift", emoji: "🎁", label: "Gift", accent: "210,148,40" }, { id: "together", emoji: "❤️", label: "Together", accent: "190,60,80" }
];
export const DEFAULT_REACTIONS: ReactionDefinition[] = [
  { type: "love", emoji: "❤️", label: "Love" }, { type: "interested", emoji: "👍", label: "Interested" },
  { type: "maybe", emoji: "🤔", label: "Maybe" }, { type: "pass", emoji: "👎", label: "Pass" }
];
export const SPACE_TYPES = ["Together", "Friends", "Travel", "Food", "Family", "Solo"];


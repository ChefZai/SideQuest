import {
  CURRENT_SPACE_TEMPLATE_VERSION,
  type SpaceTemplateDefinition,
  type SpaceTemplateId,
} from "./templateTypes";

export const SPACE_TEMPLATES = [
  { id: "couple", name: "Couple", description: "For date nights, future plans, and everything in between.", emoji: "❤️", accentTheme: "peach", categoryPackId: "couple" },
  { id: "friends", name: "Friends", description: "For spontaneous plans, group traditions, trips, and nights out.", emoji: "👥", accentTheme: "sky", categoryPackId: "friends" },
  { id: "travel", name: "Travel", description: "For destinations, stays, activities, food, and itineraries.", emoji: "✈️", accentTheme: "teal", categoryPackId: "travel" },
  { id: "family", name: "Family", description: "For traditions, celebrations, outings, and shared memories.", emoji: "🏡", accentTheme: "yellow", categoryPackId: "family" },
  { id: "roommates", name: "Roommates", description: "For apartment ideas, purchases, shared plans, and home life.", emoji: "🛋️", accentTheme: "lavender", categoryPackId: "roommates" },
  { id: "adventure", name: "Adventure", description: "For hikes, camping, road trips, and the outdoors.", emoji: "🧭", accentTheme: "forest", categoryPackId: "adventure" },
  { id: "school", name: "School", description: "For campus plans, study goals, events, and student life.", emoji: "🎓", accentTheme: "sky", categoryPackId: "school" },
  { id: "gaming", name: "Gaming", description: "For games, sessions, releases, tournaments, and wishlists.", emoji: "🎮", accentTheme: "lavender", categoryPackId: "gaming" },
  { id: "creative", name: "Creative", description: "For projects, inspiration, content, photography, and experiments.", emoji: "🎨", accentTheme: "peach", categoryPackId: "creative" },
  { id: "blank", name: "Blank Space", description: "Start completely from scratch.", emoji: "✨", accentTheme: "teal" },
] as const satisfies readonly Omit<SpaceTemplateDefinition, "version">[];

export const SPACE_TEMPLATE_DEFINITIONS: readonly SpaceTemplateDefinition[] = SPACE_TEMPLATES.map(template => ({
  ...template,
  version: CURRENT_SPACE_TEMPLATE_VERSION,
}));

export function getSpaceTemplateDefinition(id: unknown): SpaceTemplateDefinition {
  return SPACE_TEMPLATE_DEFINITIONS.find(template => template.id === id)
    ?? SPACE_TEMPLATE_DEFINITIONS.find(template => template.id === "blank")!;
}

export function suggestedSpaceTemplateId(id: unknown): SpaceTemplateId {
  return getSpaceTemplateDefinition(id).id;
}

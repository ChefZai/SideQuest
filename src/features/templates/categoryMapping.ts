import type { IdeaTemplateId } from "./templateTypes";

export interface CategoryMatch {
  id: string;
  label: string;
}

export const IDEA_TEMPLATE_CATEGORY_PRIORITIES: Readonly<Record<IdeaTemplateId, readonly string[]>> = {
  restaurant: ["Restaurants", "Food & Drinks", "Food", "Date Night", "Weekend Plans", "Activities", "Activity"],
  coffee: ["Restaurants", "Food & Drinks", "Food", "Date Night", "Places", "Activities", "Activity"],
  movie: ["Movies & Shows", "Date Night", "Game Night", "Game Nights", "Weekend Plans", "Activities", "Activity"],
  event: ["Concerts", "Campus Events", "House Events", "Weekend Plans", "Activities", "Activity"],
  "day-trip": ["Weekend Trips", "Trips", "Outings", "Scenic Places", "Road Trips", "Activities", "Activity"],
  trip: ["Destinations", "Weekend Trips", "Trips", "Vacations", "Bucket List", "Activities", "Activity"],
  hotel: ["Hotels", "Destinations", "Trips", "Vacations", "Activities", "Activity"],
  hike: ["Hiking", "Scenic Places", "Outdoors", "Weekend Plans", "Activities", "Activity"],
  camping: ["Camping", "Weekend Trips", "Outdoors", "Road Trips", "Activities", "Activity"],
  gift: ["Gifts", "Birthdays", "Holidays", "Future Dreams", "Purchases", "Activities", "Activity"],
  game: ["Games to Try", "Game Night", "Game Nights", "Co-op", "Competitive", "Activities", "Activity"],
  book: ["Books", "Reading", "Inspiration", "Goals", "Activities", "Activity"],
  "photo-spot": ["Photography", "Places", "Scenic Places", "Content Ideas", "Activities", "Activity"],
  activity: ["Shared Activities", "Kids Activities", "Water Activities", "Weekend Plans", "Outings", "Activities", "Activity"],
  custom: ["Inspiration", "Future Dreams", "Projects", "Activities", "Activity"],
};

export function normalizeCategoryName(value: string): string {
  return value.toLocaleLowerCase().normalize("NFKD").replace(/[’']/g, "").replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function resolveIdeaCategory<T extends CategoryMatch>(templateId: IdeaTemplateId, categories: readonly T[]): T | undefined {
  const byIdentity = new Map<string, T>();
  for (const category of categories) {
    byIdentity.set(normalizeCategoryName(category.id), category);
    byIdentity.set(normalizeCategoryName(category.label), category);
  }
  for (const preferred of IDEA_TEMPLATE_CATEGORY_PRIORITIES[templateId]) {
    const match = byIdentity.get(normalizeCategoryName(preferred));
    if (match) return match;
  }
  return undefined;
}

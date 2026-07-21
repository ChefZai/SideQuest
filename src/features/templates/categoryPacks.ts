import type { CategoryDefinition } from "../../types/domain";
import type { SpaceTemplateId } from "./templateTypes";

export type CategoryPackId = Exclude<SpaceTemplateId, "blank">;

type CategorySeed = readonly [id: string, emoji: string, label: string, accent: string];

const pack = (items: readonly CategorySeed[]): readonly CategoryDefinition[] => items.map(([id, emoji, label, accent]) => ({ id, emoji, label, accent }));

export const CATEGORY_PACKS: Readonly<Record<CategoryPackId, readonly CategoryDefinition[]>> = {
  couple: pack([
    ["date-night", "🌙", "Date Night", "255,180,154"], ["restaurants", "🍽️", "Restaurants", "32,181,155"], ["weekend-trips", "🚗", "Weekend Trips", "169,217,239"], ["movies-shows", "🎬", "Movies & Shows", "185,175,232"], ["future-dreams", "✨", "Future Dreams", "241,207,103"], ["gifts", "🎁", "Gifts", "255,180,154"], ["staycation", "🏡", "Staycation", "32,181,155"],
  ]),
  friends: pack([
    ["food-drinks", "🍕", "Food & Drinks", "255,180,154"], ["game-night", "🎲", "Game Night", "185,175,232"], ["sports", "🏀", "Sports", "169,217,239"], ["concerts", "🎵", "Concerts", "185,175,232"], ["weekend-plans", "☀️", "Weekend Plans", "241,207,103"], ["trips", "🧳", "Trips", "32,181,155"], ["traditions", "🤝", "Traditions", "255,180,154"],
  ]),
  travel: pack([
    ["destinations", "📍", "Destinations", "32,181,155"], ["flights", "✈️", "Flights", "169,217,239"], ["hotels", "🏨", "Hotels", "185,175,232"], ["food", "🍜", "Food", "255,180,154"], ["activities", "🎟️", "Activities", "241,207,103"], ["budget", "💰", "Budget", "32,181,155"], ["itinerary", "🗓️", "Itinerary", "169,217,239"],
  ]),
  family: pack([
    ["holidays", "🎊", "Holidays", "255,180,154"], ["birthdays", "🎂", "Birthdays", "241,207,103"], ["recipes", "🥘", "Recipes", "32,181,155"], ["outings", "🧺", "Outings", "169,217,239"], ["vacations", "🏖️", "Vacations", "185,175,232"], ["traditions", "🤝", "Traditions", "255,180,154"], ["kids-activities", "🪁", "Kids Activities", "241,207,103"],
  ]),
  roommates: pack([
    ["home-ideas", "🏡", "Home Ideas", "32,181,155"], ["purchases", "🛒", "Purchases", "241,207,103"], ["groceries", "🥬", "Groceries", "32,181,155"], ["shared-activities", "🎲", "Shared Activities", "185,175,232"], ["apartment-projects", "🛠️", "Apartment Projects", "255,180,154"], ["house-events", "🎉", "House Events", "169,217,239"],
  ]),
  adventure: pack([
    ["hiking", "🥾", "Hiking", "32,181,155"], ["camping", "⛺", "Camping", "241,207,103"], ["road-trips", "🚙", "Road Trips", "169,217,239"], ["water-activities", "🛶", "Water Activities", "169,217,239"], ["scenic-places", "🏞️", "Scenic Places", "32,181,155"], ["gear", "🎒", "Gear", "185,175,232"], ["bucket-list", "✨", "Bucket List", "255,180,154"],
  ]),
  school: pack([
    ["campus-events", "🎟️", "Campus Events", "169,217,239"], ["study-sessions", "📚", "Study Sessions", "185,175,232"], ["food", "🍜", "Food", "255,180,154"], ["clubs", "🤝", "Clubs", "32,181,155"], ["projects", "📝", "Projects", "241,207,103"], ["weekend-plans", "☀️", "Weekend Plans", "169,217,239"], ["goals", "🎯", "Goals", "255,180,154"],
  ]),
  gaming: pack([
    ["games-to-try", "🕹️", "Games to Try", "185,175,232"], ["co-op", "🤝", "Co-op", "32,181,155"], ["competitive", "🏆", "Competitive", "241,207,103"], ["releases", "📅", "Releases", "169,217,239"], ["backlog", "📚", "Backlog", "255,180,154"], ["game-nights", "🎮", "Game Nights", "185,175,232"], ["gear", "🎧", "Gear", "32,181,155"],
  ]),
  creative: pack([
    ["projects", "🛠️", "Projects", "255,180,154"], ["inspiration", "✨", "Inspiration", "241,207,103"], ["photography", "📷", "Photography", "169,217,239"], ["content-ideas", "💡", "Content Ideas", "241,207,103"], ["places", "📍", "Places", "32,181,155"], ["experiments", "🧪", "Experiments", "185,175,232"], ["collaborations", "🤝", "Collaborations", "255,180,154"],
  ]),
};

export function getCategoryPack(templateId: SpaceTemplateId): CategoryDefinition[] {
  if (templateId === "blank") return [];
  return CATEGORY_PACKS[templateId].map(category => ({ ...category }));
}

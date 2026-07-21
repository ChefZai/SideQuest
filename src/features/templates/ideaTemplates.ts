import {
  CURRENT_IDEA_TEMPLATE_VERSION,
  type IdeaTemplateDefinition,
  type IdeaTemplateId,
  type SpaceTemplateId,
  type TemplateFieldDefinition,
} from "./templateTypes";

const text = (key: string, maxLength = 500): TemplateFieldDefinition => ({ key, kind: "string", maxLength });
const number = (key: string, min = 0, max = 10_000_000): TemplateFieldDefinition => ({ key, kind: "number", min, max });
const list = (key: string, maxItems = 20, maxLength = 200): TemplateFieldDefinition => ({ key, kind: "string-list", maxItems, maxLength });

const all: readonly SpaceTemplateId[] = ["couple", "friends", "travel", "family", "roommates", "adventure", "school", "gaming", "creative", "blank"];

const definitions = [
  { id: "restaurant", name: "Restaurant", description: "Save somewhere you would like to eat.", emoji: "🍽️", exampleFields: ["Cuisine", "Price", "Reservation"], suggestedFor: ["couple", "friends", "travel", "family", "roommates", "school", "blank"], fields: [text("cuisine", 80), text("priceRange", 40), text("reservationLink", 2048), text("menuLink", 2048), text("preferredTiming", 120)] },
  { id: "coffee", name: "Coffee Shop", description: "Keep a café or coffee stop for later.", emoji: "☕", exampleFields: ["Atmosphere", "What to try", "Website"], suggestedFor: ["couple", "friends", "travel", "school", "creative", "blank"], fields: [text("atmosphere", 120), text("itemToTry", 160), text("website", 2048)] },
  { id: "movie", name: "Movie", description: "Remember something you want to watch together.", emoji: "🎬", exampleFields: ["Genre", "Runtime", "Streaming"], suggestedFor: ["couple", "friends", "family", "roommates", "blank"], fields: [text("genre", 80), number("releaseYear", 1888, 2200), number("runtimeMinutes", 1, 1440), text("streamingService", 80), text("trailerLink", 2048), text("watchLocation", 160)] },
  { id: "event", name: "Event", description: "Save a show, celebration, or gathering.", emoji: "🎟️", exampleFields: ["Venue", "Date", "Tickets"], suggestedFor: ["couple", "friends", "travel", "family", "school", "creative", "blank"], fields: [text("venue", 160), text("eventDate", 40), text("eventTime", 40), text("ticketLink", 2048), number("estimatedPrice")] },
  { id: "day-trip", name: "Day Trip", description: "Plan a nearby change of scenery.", emoji: "🚗", exampleFields: ["Destination", "Drive time", "Activities"], suggestedFor: ["couple", "friends", "travel", "family", "adventure", "blank"], fields: [text("destination", 160), number("estimatedDriveMinutes", 0, 10080), text("idealSeason", 40), list("activities"), number("estimatedCost")] },
  { id: "trip", name: "Trip / Vacation", description: "Gather the beginnings of a longer getaway.", emoji: "✈️", exampleFields: ["Destination", "Dates", "Budget"], suggestedFor: ["couple", "friends", "travel", "family", "adventure", "blank"], fields: [text("destination", 160), list("potentialDates", 20, 40), number("budgetGoal"), list("lodgingIdeas"), text("travelMethod", 80), list("activities")] },
  { id: "hotel", name: "Hotel", description: "Keep a stay you may want to book.", emoji: "🏨", exampleFields: ["Nightly estimate", "Amenities", "Dates"], suggestedFor: ["couple", "friends", "travel", "family", "blank"], fields: [number("nightlyEstimate"), text("bookingLink", 2048), list("amenities"), list("preferredDates", 20, 40)] },
  { id: "hike", name: "Hike", description: "Save a trail worth exploring.", emoji: "🥾", exampleFields: ["Distance", "Difficulty", "Season"], suggestedFor: ["couple", "friends", "travel", "family", "adventure", "blank"], fields: [text("trailName", 160), number("distanceMiles", 0, 10000), text("difficulty", 40), number("elevationFeet", -2000, 40000), text("bestSeason", 40), text("trailLink", 2048), text("packingNotes", 1000)] },
  { id: "camping", name: "Camping", description: "Start planning a night outdoors.", emoji: "⛺", exampleFields: ["Campground", "Dates", "Packing"], suggestedFor: ["couple", "friends", "family", "adventure", "blank"], fields: [text("campground", 160), list("dates", 20, 40), text("reservationLink", 2048), text("campsiteType", 80), list("packingList", 50), number("estimatedCost")] },
  { id: "gift", name: "Gift", description: "Remember a thoughtful possibility for someone.", emoji: "🎁", exampleFields: ["Recipient", "Occasion", "Deadline"], suggestedFor: ["couple", "friends", "family", "roommates", "blank"], fields: [text("recipient", 120), text("occasion", 120), number("estimatedPrice"), text("purchaseLink", 2048), text("deadline", 40)] },
  { id: "game", name: "Game", description: "Save something to play together.", emoji: "🎮", exampleFields: ["Platform", "Players", "Session"], suggestedFor: ["couple", "friends", "family", "roommates", "school", "gaming", "blank"], fields: [text("platform", 80), number("playerCount", 1, 1000), text("genre", 80), text("storeLink", 2048), text("plannedSession", 120)] },
  { id: "book", name: "Book", description: "Keep a book for a shared or solo reading list.", emoji: "📚", exampleFields: ["Author", "Format", "Reading plan"], suggestedFor: ["couple", "friends", "family", "school", "creative", "blank"], fields: [text("author", 160), text("genre", 80), text("format", 40), text("bookLink", 2048), text("readingPlan", 300)] },
  { id: "photo-spot", name: "Photo Spot", description: "Remember a place and the light you want to find there.", emoji: "📷", exampleFields: ["Best time", "Style", "Access"], suggestedFor: ["couple", "friends", "travel", "adventure", "creative", "blank"], fields: [text("placeName", 160), text("bestTime", 80), text("photoStyle", 120), text("accessNotes", 500), text("inspirationLink", 2048)] },
  { id: "activity", name: "Activity", description: "Save something you would like to do.", emoji: "✨", exampleFields: ["Price", "Duration", "Booking"], suggestedFor: all, fields: [number("estimatedPrice"), number("durationMinutes", 0, 10080), text("bookingLink", 2048), text("bestTiming", 120)] },
  { id: "custom", name: "Custom", description: "Start with the familiar open-ended Idea form.", emoji: "💡", exampleFields: ["Title", "Notes", "Location"], suggestedFor: all, fields: [] },
] as const satisfies readonly Omit<IdeaTemplateDefinition, "version">[];

export const IDEA_TEMPLATE_DEFINITIONS: readonly IdeaTemplateDefinition[] = definitions.map(template => ({
  ...template,
  version: CURRENT_IDEA_TEMPLATE_VERSION,
}));

export function getIdeaTemplateDefinition(id: unknown): IdeaTemplateDefinition {
  return IDEA_TEMPLATE_DEFINITIONS.find(template => template.id === id)
    ?? IDEA_TEMPLATE_DEFINITIONS.find(template => template.id === "custom")!;
}

export function getSuggestedIdeaTemplates(spaceTemplateId: unknown): IdeaTemplateDefinition[] {
  return IDEA_TEMPLATE_DEFINITIONS.filter(template => template.suggestedFor.includes(spaceTemplateId as SpaceTemplateId));
}

export function suggestedIdeaTemplateId(id: unknown): IdeaTemplateId {
  return getIdeaTemplateDefinition(id).id;
}

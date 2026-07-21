export const SPACE_TEMPLATE_IDS = [
  "couple",
  "friends",
  "travel",
  "family",
  "roommates",
  "adventure",
  "school",
  "gaming",
  "creative",
  "blank",
] as const;

export type SpaceTemplateId = (typeof SPACE_TEMPLATE_IDS)[number];

export const IDEA_TEMPLATE_IDS = [
  "restaurant",
  "coffee",
  "movie",
  "event",
  "day-trip",
  "trip",
  "hotel",
  "hike",
  "camping",
  "gift",
  "game",
  "book",
  "photo-spot",
  "activity",
  "custom",
] as const;

export type IdeaTemplateId = (typeof IDEA_TEMPLATE_IDS)[number];

export const CURRENT_SPACE_TEMPLATE_VERSION = 1;
export const CURRENT_IDEA_TEMPLATE_VERSION = 1;

export const ACCENT_THEMES = [
  "teal",
  "sky",
  "peach",
  "yellow",
  "lavender",
  "forest",
] as const;

export type AccentTheme = (typeof ACCENT_THEMES)[number];

export interface SpaceTemplateMetadata {
  templateId?: SpaceTemplateId;
  templateVersion?: number;
  accentTheme?: AccentTheme;
  starterPackApplied?: boolean;
}

export interface RestaurantTemplateData {
  cuisine?: string;
  priceRange?: string;
  reservationLink?: string;
  menuLink?: string;
  preferredTiming?: string;
}

export interface CoffeeTemplateData {
  atmosphere?: string;
  itemToTry?: string;
  website?: string;
}

export interface MovieTemplateData {
  genre?: string;
  releaseYear?: number;
  runtimeMinutes?: number;
  streamingService?: string;
  trailerLink?: string;
  watchLocation?: string;
}

export interface EventTemplateData {
  venue?: string;
  eventDate?: string;
  eventTime?: string;
  ticketLink?: string;
  estimatedPrice?: number;
}

export interface DayTripTemplateData {
  destination?: string;
  estimatedDriveMinutes?: number;
  idealSeason?: string;
  activities?: string[];
  estimatedCost?: number;
}

export interface TripTemplateData {
  destination?: string;
  potentialDates?: string[];
  budgetGoal?: number;
  lodgingIdeas?: string[];
  travelMethod?: string;
  activities?: string[];
}

export interface HotelTemplateData {
  nightlyEstimate?: number;
  bookingLink?: string;
  amenities?: string[];
  preferredDates?: string[];
}

export interface HikeTemplateData {
  trailName?: string;
  distanceMiles?: number;
  difficulty?: string;
  elevationFeet?: number;
  bestSeason?: string;
  trailLink?: string;
  packingNotes?: string;
}

export interface CampingTemplateData {
  campground?: string;
  dates?: string[];
  reservationLink?: string;
  campsiteType?: string;
  packingList?: string[];
  estimatedCost?: number;
}

export interface GiftTemplateData {
  recipient?: string;
  occasion?: string;
  estimatedPrice?: number;
  purchaseLink?: string;
  deadline?: string;
}

export interface GameTemplateData {
  platform?: string;
  playerCount?: number;
  genre?: string;
  storeLink?: string;
  plannedSession?: string;
}

export interface BookTemplateData {
  author?: string;
  genre?: string;
  format?: string;
  bookLink?: string;
  readingPlan?: string;
}

export interface PhotoSpotTemplateData {
  placeName?: string;
  bestTime?: string;
  photoStyle?: string;
  accessNotes?: string;
  inspirationLink?: string;
}

export interface ActivityTemplateData {
  estimatedPrice?: number;
  durationMinutes?: number;
  bookingLink?: string;
  bestTiming?: string;
}

export interface CustomTemplateData {}

export interface IdeaTemplateDataById {
  restaurant: RestaurantTemplateData;
  coffee: CoffeeTemplateData;
  movie: MovieTemplateData;
  event: EventTemplateData;
  "day-trip": DayTripTemplateData;
  trip: TripTemplateData;
  hotel: HotelTemplateData;
  hike: HikeTemplateData;
  camping: CampingTemplateData;
  gift: GiftTemplateData;
  game: GameTemplateData;
  book: BookTemplateData;
  "photo-spot": PhotoSpotTemplateData;
  activity: ActivityTemplateData;
  custom: CustomTemplateData;
}

export type IdeaTemplateData = IdeaTemplateDataById[IdeaTemplateId];
export type IdeaTemplateDataFor<T extends IdeaTemplateId> = IdeaTemplateDataById[T];

export interface IdeaTemplateMetadata<T extends IdeaTemplateId = IdeaTemplateId> {
  templateId?: T;
  templateVersion?: number;
  templateData?: IdeaTemplateDataFor<T>;
}

export type TemplateFieldKind = "string" | "number" | "string-list";

export interface TemplateFieldDefinition {
  key: string;
  kind: TemplateFieldKind;
  maxLength?: number;
  min?: number;
  max?: number;
  maxItems?: number;
}

export interface SpaceTemplateDefinition {
  id: SpaceTemplateId;
  version: number;
  name: string;
  description: string;
  emoji: string;
  accentTheme: AccentTheme;
  categoryPackId?: Exclude<SpaceTemplateId, "blank">;
}

export interface IdeaTemplateDefinition<T extends IdeaTemplateId = IdeaTemplateId> {
  id: T;
  version: number;
  name: string;
  description: string;
  emoji: string;
  exampleFields: readonly string[];
  suggestedFor: readonly SpaceTemplateId[];
  fields: readonly TemplateFieldDefinition[];
}

export interface InspirationSuggestion {
  id: string;
  title: string;
  description: string;
  templateId: IdeaTemplateId;
  spaceTemplateIds: readonly SpaceTemplateId[];
  tags: readonly string[];
  season?: "spring" | "summer" | "fall" | "winter";
  prefill?: {
    title?: string;
    description?: string;
    templateData?: IdeaTemplateData;
  };
}

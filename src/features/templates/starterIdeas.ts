import type { CategoryDefinition, UserProfile } from "../../types/domain";
import type { IdeaTemplateData, IdeaTemplateId, SpaceTemplateId } from "./templateTypes";

export interface StarterIdeaDefinition {
  id: string;
  title: string;
  description: string;
  templateId: IdeaTemplateId;
  categoryId: string;
  templateData?: IdeaTemplateData;
}

export interface StarterIdeaDraft extends StarterIdeaDefinition {}

const starter = (
  id: string,
  title: string,
  description: string,
  templateId: IdeaTemplateId,
  categoryId: string,
  templateData?: IdeaTemplateData,
): StarterIdeaDefinition => ({ id, title, description, templateId, categoryId, templateData });

export const STARTER_IDEAS: Readonly<Record<Exclude<SpaceTemplateId, "blank">, readonly StarterIdeaDefinition[]>> = {
  couple: [
    starter("sunset-date", "Plan a sunset date", "Choose a view, bring something good, and leave room for the moment.", "activity", "date-night"),
    starter("new-restaurant", "Try a restaurant neither of us has visited", "Save a cuisine or place that would feel new to both of you.", "restaurant", "restaurants"),
    starter("weekend-getaway", "Take a weekend getaway", "Start with a place that feels far enough away without needing a huge plan.", "trip", "weekend-trips"),
    starter("movie-night", "Create a shared movie night", "Pick the movie, snacks, and the kind of night you want.", "movie", "movies-shows"),
    starter("dream-destination", "Choose a dream destination", "Save somewhere you would both love to experience someday.", "trip", "future-dreams"),
  ],
  friends: [
    starter("new-restaurant", "Try a new restaurant", "Save somewhere the whole group has not tried yet.", "restaurant", "food-drinks"),
    starter("game-night", "Plan a game night", "Pick a game, a place, and a night that works later.", "game", "game-night"),
    starter("live-event", "Attend a live event", "Keep a concert, show, or event worth doing together.", "event", "concerts"),
    starter("weekend-road-trip", "Take a weekend road trip", "Choose a direction now and fill in the stops later.", "trip", "trips"),
    starter("group-tradition", "Start a group tradition", "Save something small that could become part of your friendship.", "activity", "traditions"),
  ],
  travel: [
    starter("destination", "Choose a destination", "Start with the place you keep talking about.", "trip", "destinations"),
    starter("dream-hotel", "Save a dream hotel", "Keep a stay that could shape the whole trip.", "hotel", "hotels"),
    starter("food-list", "Build a food list", "Collect dishes, cafés, and restaurants you do not want to miss.", "restaurant", "food"),
    starter("must-do", "Add a must-do activity", "Save the experience that would make the trip feel real.", "activity", "activities"),
    starter("trip-budget", "Estimate a trip budget", "Capture a comfortable starting range before making commitments.", "custom", "budget"),
  ],
  family: [
    starter("family-outing", "Plan a family outing", "Save an easy day everyone could enjoy.", "activity", "outings"),
    starter("celebration", "Make the next celebration feel special", "Collect one thoughtful idea for an upcoming birthday or milestone.", "activity", "birthdays"),
    starter("recipe", "Cook a new family recipe", "Save something worth making and remembering together.", "custom", "recipes"),
    starter("vacation", "Choose a family vacation idea", "Start with a destination and let everyone add what excites them.", "trip", "vacations"),
    starter("tradition", "Create a new family tradition", "Save a small ritual that could return every year.", "activity", "traditions"),
  ],
  roommates: [
    starter("home-upgrade", "Choose one home upgrade", "Save a change that would make the shared space feel better.", "custom", "home-ideas"),
    starter("shared-purchase", "Save a shared purchase", "Keep something useful everyone may want to contribute to.", "gift", "purchases"),
    starter("roommate-night", "Plan a roommate night", "Choose something easy and fun to do at home or nearby.", "activity", "shared-activities"),
    starter("apartment-project", "Start an apartment project", "Capture one practical or creative project for the space.", "custom", "apartment-projects"),
    starter("house-event", "Host a small house event", "Save a low-pressure gathering idea for later.", "event", "house-events"),
  ],
  adventure: [
    starter("nearby-hike", "Find a nearby hike", "Save a trail that matches the group’s energy.", "hike", "hiking"),
    starter("camping-weekend", "Plan a camping weekend", "Start with a campground or region and build from there.", "camping", "camping"),
    starter("scenic-drive", "Save a scenic drive", "Keep a route worth taking slowly.", "day-trip", "road-trips"),
    starter("outdoor-activity", "Try a new outdoor activity", "Save something that gets everyone outside in a new way.", "activity", "water-activities"),
    starter("sunrise-location", "Pick a sunrise location", "Find a beautiful place worth waking up early for.", "photo-spot", "scenic-places"),
  ],
  school: [
    starter("campus-event", "Go to a campus event", "Save an event that would be better with someone else.", "event", "campus-events"),
    starter("study-session", "Plan a focused study session", "Choose a subject, place, and realistic goal.", "activity", "study-sessions"),
    starter("campus-food", "Try a new food spot", "Keep a café or restaurant near campus for later.", "restaurant", "food"),
    starter("weekend-plan", "Make a weekend plan", "Save something that gives the week a bright endpoint.", "activity", "weekend-plans"),
    starter("shared-goal", "Set a shared semester goal", "Capture something you want to encourage each other to finish.", "custom", "goals"),
  ],
  gaming: [
    starter("game-to-try", "Choose a game to try", "Save a game the group is curious about.", "game", "games-to-try"),
    starter("coop-night", "Plan a co-op night", "Pick a game and a flexible session for everyone.", "game", "co-op"),
    starter("release", "Track an upcoming release", "Keep a game you do not want to forget when it launches.", "game", "releases"),
    starter("backlog", "Rescue something from the backlog", "Choose one game everyone already owns or wants to finish.", "game", "backlog"),
    starter("tournament", "Host a friendly tournament", "Save a simple bracket or competitive night for later.", "event", "competitive"),
  ],
  creative: [
    starter("shared-project", "Start a shared creative project", "Capture the smallest version of something you would love to make.", "custom", "projects"),
    starter("photo-walk", "Plan a photo walk", "Choose a place, time, and visual idea to explore.", "photo-spot", "photography"),
    starter("content-idea", "Save a content idea", "Keep the spark now and shape it when the timing is right.", "custom", "content-ideas"),
    starter("creative-place", "Visit an inspiring place", "Save a museum, neighborhood, studio, or landscape.", "activity", "places"),
    starter("experiment", "Try a creative experiment", "Choose a constraint or medium you have not used before.", "activity", "experiments"),
  ],
};

export function getStarterIdeas(templateId: SpaceTemplateId): StarterIdeaDraft[] {
  if (templateId === "blank") return [];
  return STARTER_IDEAS[templateId].map(idea => ({
    ...idea,
    templateData: idea.templateData ? { ...idea.templateData } : undefined,
  }));
}

export function starterIdeaDocumentId(spaceId: string, starterId: string): string {
  const safe = `${spaceId}-${starterId}`.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 180);
  return `starter-${safe}`;
}

export function starterCategory(
  categories: readonly CategoryDefinition[],
  starterIdea: StarterIdeaDefinition,
): CategoryDefinition | undefined {
  return categories.find(category => category.id === starterIdea.categoryId) ?? categories[0];
}

export function shouldDefaultStarterIdeas(profile: UserProfile): boolean {
  return profile.onboarding.completed !== true;
}

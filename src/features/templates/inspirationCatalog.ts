import type { IdeaTemplateData, IdeaTemplateId, InspirationSuggestion, SpaceTemplateId } from "./templateTypes";

const ALL: readonly SpaceTemplateId[] = ["couple","friends","travel","family","roommates","adventure","school","gaming","creative","blank"];
const SOCIAL: readonly SpaceTemplateId[] = ["couple","friends","family","roommates","school","blank"];
const OUTDOOR: readonly SpaceTemplateId[] = ["couple","friends","travel","family","adventure","creative","blank"];
const make = (id:string,title:string,description:string,templateId:IdeaTemplateId,tags:readonly string[],spaceTemplateIds:readonly SpaceTemplateId[]=ALL,templateData?:IdeaTemplateData):InspirationSuggestion=>({id,title,description,templateId,tags,spaceTemplateIds,prefill:{title,description,templateData}});

export const INSPIRATION_CATALOG: readonly InspirationSuggestion[] = [
  make("new-cuisine","Try a cuisine neither of you has had","Choose something unfamiliar and make the first visit part of the story.","restaurant",["popular","food-drinks","date-night"],SOCIAL,{preferredTiming:"An unhurried evening"}),
  make("sunset-picnic","Plan a sunset picnic","Pack a few favorites and find a view worth lingering over.","activity",["popular","outdoors","date-night","budget-friendly"],OUTDOOR,{bestTiming:"Golden hour"}),
  make("local-museum","Visit a local museum","Pick one exhibit and leave room to wander.","activity",["popular","rainy-day","weekend-adventure"],ALL),
  make("scenic-drive","Take a scenic drive","Choose the road first and let the stops stay flexible.","day-trip",["popular","weekend-adventure","outdoors"],OUTDOOR,{activities:["Scenic overlook","Local snack stop"]}),
  make("themed-movie-night","Host a themed movie night","Pair a movie with snacks, music, or a simple dress theme.","movie",["popular","at-home","rainy-day","budget-friendly"],SOCIAL),
  make("pottery-class","Try a pottery class","Make something imperfect together and keep the result.","activity",["popular","date-night","weekend-adventure"],SOCIAL),
  make("farmers-market","Go to a farmers market","Pick one ingredient you have never cooked with before.","activity",["food-drinks","outdoors","budget-friendly"],ALL,{bestTiming:"Weekend morning"}),
  make("no-phone-date","Plan a no-phone date","Choose an easy activity and keep the evening free from notifications.","activity",["date-night","at-home","budget-friendly"],["couple","blank"]),
  make("nearby-waterfall","Find a nearby waterfall","Save a trail or overlook for a fresh-air day.","hike",["outdoors","weekend-adventure","bucket-list"],OUTDOOR),
  make("outdoor-concert","Attend an outdoor concert","Save a performance that would feel even better under an open sky.","event",["outdoors","weekend-adventure","date-night"],SOCIAL),
  make("new-recipe","Cook a new recipe together","Choose one dish, divide the jobs, and make enough to share.","activity",["at-home","food-drinks","budget-friendly"],SOCIAL),
  make("thrift-challenge","Plan a thrift-store challenge","Set a tiny budget and find the funniest or most thoughtful thing.","activity",["budget-friendly","weekend-adventure"],SOCIAL),
  make("bookstore-picks","Choose books for each other","Visit a bookstore and each pick something the other might love.","book",["rainy-day","date-night","budget-friendly"],SOCIAL),
  make("nearby-town","Explore a nearby town","Save a walkable place with one meal and one unexpected stop.","day-trip",["weekend-adventure","food-drinks","bucket-list"],OUTDOOR),
  make("golden-hour-photos","Take photos at golden hour","Choose a place, a mood, and a little time to notice the light.","photo-spot",["outdoors","budget-friendly","popular"],ALL,{bestTime:"Golden hour"}),
  make("seasonal-bucket-list","Create a seasonal bucket list","Collect a handful of small things you would be happy to actually do.","custom",["bucket-list","popular"],ALL),
  make("breakfast-for-dinner","Make breakfast for dinner","Keep it cozy, choose everyone’s favorite, and ignore the clock.","activity",["at-home","food-drinks","budget-friendly"],SOCIAL),
  make("living-room-fort","Build a living-room hideaway","Use blankets, lights, and a movie to make home feel different.","activity",["at-home","rainy-day","budget-friendly"],SOCIAL),
  make("rain-walk","Take a gentle rain walk","Choose a familiar route, bring umbrellas, and stop somewhere warm.","activity",["rainy-day","outdoors","budget-friendly"],OUTDOOR),
  make("cafe-afternoon","Find a café for a slow afternoon","Save somewhere that feels good for talking, reading, or doing nothing.","coffee",["rainy-day","food-drinks","date-night"],SOCIAL,{atmosphere:"Warm and unhurried"}),
  make("puzzle-evening","Start a puzzle evening","Choose something everyone can return to across a few nights.","activity",["at-home","rainy-day","budget-friendly"],SOCIAL),
  make("indoor-climbing","Try indoor climbing","Book a beginner session and let the goal be trying, not winning.","activity",["rainy-day","weekend-adventure"],SOCIAL),
  make("free-community-event","Find a free community event","Look for an open house, performance, market, or public workshop.","event",["budget-friendly","weekend-adventure"],ALL,{estimatedPrice:0}),
  make("library-date","Spend an hour at the library","Browse separately, then show each other what you found.","activity",["budget-friendly","rainy-day","date-night"],ALL,{estimatedPrice:0}),
  make("neighborhood-walk","Explore a neighborhood on foot","Pick a route you usually pass by and notice what you have missed.","activity",["budget-friendly","outdoors"],ALL,{estimatedPrice:0}),
  make("picnic-leftovers","Turn leftovers into a picnic","Pack what you already have and change only the setting.","activity",["budget-friendly","food-drinks","outdoors"],SOCIAL),
  make("game-tournament","Hold a tiny game tournament","Pick a few short games and invent an unserious prize.","game",["at-home","rainy-day"],SOCIAL,{plannedSession:"One relaxed evening"}),
  make("playlist-night","Build a shared playlist","Take turns adding songs and tell the story behind one choice.","activity",["at-home","budget-friendly"],ALL),
  make("home-tasting","Host an at-home tasting","Compare a few chocolates, teas, fruits, or snacks without making it formal.","activity",["at-home","food-drinks","date-night"],SOCIAL),
  make("recipe-swap","Trade favorite recipes","Each person chooses something meaningful for the group to make.","activity",["at-home","food-drinks"],SOCIAL),
  make("sunrise-walk","Take a sunrise walk","Choose an easy place and reward the early start with breakfast.","activity",["outdoors","weekend-adventure","bucket-list"],OUTDOOR,{bestTiming:"Sunrise"}),
  make("beginner-hike","Choose a beginner-friendly hike","Save a short trail with a view and plenty of time.","hike",["outdoors","weekend-adventure"],OUTDOOR,{difficulty:"Easy"}),
  make("camping-weekend","Plan one night of camping","Start with a campground and a simple packing list.","camping",["outdoors","weekend-adventure","bucket-list"],OUTDOOR),
  make("paddle-day","Try a paddle day","Save a calm place for kayaking, canoeing, or paddleboarding.","activity",["outdoors","weekend-adventure","bucket-list"],OUTDOOR),
  make("stargazing","Find a stargazing spot","Choose a darker sky, bring something warm, and stay awhile.","photo-spot",["outdoors","date-night","bucket-list"],OUTDOOR,{bestTime:"After dark",photoStyle:"Night sky"}),
  make("botanical-garden","Wander a botanical garden","Save a quiet place that changes with the season.","activity",["outdoors","date-night","weekend-adventure"],ALL),
  make("signature-dessert","Find a signature dessert","Choose one thing worth crossing town to try.","restaurant",["food-drinks","date-night"],SOCIAL,{preferredTiming:"After dinner"}),
  make("dumpling-night","Make dumplings together","Choose a filling, set up an assembly line, and accept the odd shapes.","activity",["food-drinks","at-home"],SOCIAL),
  make("coffee-crawl","Plan a mini coffee crawl","Pick two or three stops and order something different at each.","coffee",["food-drinks","weekend-adventure"],SOCIAL),
  make("food-hall","Explore a food hall","Split a few dishes so everyone can try more than one thing.","restaurant",["food-drinks","friends","popular"],SOCIAL),
  make("cooking-class","Take a cooking class","Choose a dish you would be excited to make again at home.","activity",["food-drinks","date-night","weekend-adventure"],SOCIAL),
  make("dream-train-trip","Save a dream train journey","Start with the route and let the details grow later.","trip",["bucket-list","weekend-adventure"],ALL,{travelMethod:"Train"}),
  make("cabin-weekend","Plan a quiet cabin weekend","Save a stay with one beautiful view and very little schedule.","hotel",["bucket-list","weekend-adventure","date-night"],OUTDOOR,{amenities:["A view","A cozy common space"]}),
  make("learn-a-skill","Learn one small skill together","Choose something teachable in an afternoon and celebrate being beginners.","activity",["bucket-list","at-home"],ALL),
  make("dream-hotel","Save a once-in-a-lifetime stay","Keep the place now; decide whether and when later.","hotel",["bucket-list","travel"],ALL),
  make("national-park","Choose a national park to explore","Begin with one landscape you both want to see in person.","trip",["bucket-list","outdoors"],OUTDOOR),
  make("live-show","See a live show in a new genre","Pick something neither of you would normally choose.","event",["bucket-list","date-night","weekend-adventure"],SOCIAL),
  make("photo-project","Start a one-day photo project","Choose one theme and notice it everywhere you go.","photo-spot",["creative","budget-friendly","outdoors"],ALL,{photoStyle:"One shared theme"}),
  make("volunteer-day","Spend a day helping locally","Choose a cause the group cares about and find a clear first step.","activity",["weekend-adventure","budget-friendly"],ALL),
  make("future-letter","Write a letter to your future selves","Capture what you hope you will remember, then choose when to reopen it.","activity",["at-home","date-night","bucket-list"],ALL)
];

export const INSPIRATION_SECTIONS = ["popular","for-this-space","rainy-day","weekend-adventure","date-night","budget-friendly","at-home","outdoors","food-drinks","bucket-list"] as const;
export type InspirationSectionId = typeof INSPIRATION_SECTIONS[number];
export function suggestionsForSection(section:InspirationSectionId,spaceTemplateId:unknown):InspirationSuggestion[]{
  const template=(typeof spaceTemplateId==="string"?spaceTemplateId:"blank") as SpaceTemplateId;
  if(section==="for-this-space")return INSPIRATION_CATALOG.filter(item=>item.spaceTemplateIds.includes(template)).slice(0,8);
  return INSPIRATION_CATALOG.filter(item=>item.tags.includes(section)).slice(0,8);
}

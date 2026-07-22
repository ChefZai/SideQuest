import type { InspirationSuggestion, SpaceTemplateId } from "../features/templates/templateTypes";

export const INSPIRATION_FILTERS=[
  {id:"for-you",label:"For You"},{id:"date-night",label:"Date Night"},{id:"food-drinks",label:"Food & Drinks"},{id:"weekend",label:"Weekend"},{id:"outdoors",label:"Outdoors"},{id:"at-home",label:"At Home"},{id:"budget-friendly",label:"Budget Friendly"},{id:"travel",label:"Travel"},{id:"seasonal",label:"Seasonal"},{id:"bucket-list",label:"Bucket List"},
] as const;
export type InspirationFilterId=typeof INSPIRATION_FILTERS[number]["id"];

const tagMap:Readonly<Record<Exclude<InspirationFilterId,"for-you"|"travel"|"seasonal">,readonly string[]>>={"date-night":["date-night"],"food-drinks":["food-drinks"],weekend:["weekend-adventure"],outdoors:["outdoors"],"at-home":["at-home"],"budget-friendly":["budget-friendly"],"bucket-list":["bucket-list"]};
export function inspirationItems(items:readonly InspirationSuggestion[],filter:InspirationFilterId,spaceTemplateId:SpaceTemplateId|undefined):InspirationSuggestion[]{
  if(filter==="for-you")return items.filter(item=>item.spaceTemplateIds.includes(spaceTemplateId||"blank"));
  if(filter==="travel")return items.filter(item=>["trip","hotel","day-trip"].includes(item.templateId)||item.tags.includes("bucket-list"));
  if(filter==="seasonal")return items.filter(item=>item.id.includes("seasonal")||item.tags.includes("outdoors")||item.tags.includes("rainy-day"));
  return items.filter(item=>tagMap[filter].some(tag=>item.tags.includes(tag)));
}
export const templateName=(id:string)=>({restaurant:"Restaurant",coffee:"Coffee Shop",movie:"Movie",event:"Event","day-trip":"Day Trip",trip:"Trip",hotel:"Hotel",hike:"Hike",camping:"Camping",gift:"Gift",game:"Game",book:"Book","photo-spot":"Photo Spot",activity:"Activity",custom:"Custom"}[id]||"Idea");
export const templateEmoji=(id:string)=>({restaurant:"\u{1F37D}\u{FE0F}",coffee:"\u{2615}",movie:"\u{1F3AC}",event:"\u{1F39F}\u{FE0F}","day-trip":"\u{1F697}",trip:"\u{2708}\u{FE0F}",hotel:"\u{1F3E8}",hike:"\u{1F97E}",camping:"\u{26FA}",gift:"\u{1F381}",game:"\u{1F3AE}",book:"\u{1F4DA}","photo-spot":"\u{1F4F7}",activity:"\u{2728}",custom:"\u{1F4A1}"}[id]||"\u{2728}");

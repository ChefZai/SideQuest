import type { IdeaTemplateId, InspirationSuggestion, SpaceTemplateId } from "../features/templates/templateTypes";
import type { CategoryDef } from "./domain";
import type { InspirationFilterId } from "./inspirationFilters";

export const INSPIRATION_INTENTS=[
  {id:"food-drinks",label:"Food & Drinks",emoji:"🍽️",helper:"Try a flavor, place, or shared table.",filter:"food-drinks"},
  {id:"date-night",label:"Date Night",emoji:"❤️",helper:"Make a little room for each other.",filter:"date-night"},
  {id:"outdoors",label:"Outdoors",emoji:"🌿",helper:"Find fresh air and a change of view.",filter:"outdoors"},
  {id:"travel",label:"Travel",emoji:"✈️",helper:"Start with somewhere you want to be.",filter:"travel"},
  {id:"stay-in",label:"Stay In",emoji:"🏡",helper:"Make home feel a little different.",filter:"at-home"},
  {id:"budget-friendly",label:"Budget Friendly",emoji:"☀️",helper:"Good memories do not need a big spend.",filter:"budget-friendly"},
  {id:"weekend",label:"Weekend",emoji:"🗓️",helper:"Give the next free day a direction.",filter:"weekend"},
  {id:"something-new",label:"Something New",emoji:"✨",helper:"Choose a possibility outside the usual.",filter:"something-new"},
  {id:"games",label:"Games",emoji:"🎮",helper:"Play together, casually or competitively.",filter:"games"},
  {id:"entertainment",label:"Entertainment",emoji:"🎟️",helper:"Find something worth watching or hearing.",filter:"entertainment"},
  {id:"learning",label:"Learning",emoji:"📚",helper:"Be beginners at something together.",filter:"learning"},
  {id:"surprise",label:"Surprise Me",emoji:"🎲",helper:"Let SideQuest choose one possibility.",filter:null},
] as const satisfies readonly {id:string;label:string;emoji:string;helper:string;filter:InspirationFilterId|null}[];
export type InspirationIntentId=typeof INSPIRATION_INTENTS[number]["id"];
export type InspirationIntent=typeof INSPIRATION_INTENTS[number];

const SPACE_ORDERS:Partial<Record<SpaceTemplateId,readonly InspirationIntentId[]>>={
  couple:["date-night","food-drinks","weekend","travel","stay-in"],travel:["travel","outdoors","food-drinks","weekend","something-new"],gaming:["games","stay-in","entertainment","food-drinks","weekend"],family:["weekend","food-drinks","travel","outdoors","budget-friendly"],adventure:["outdoors","something-new","weekend","travel","budget-friendly"],friends:["weekend","food-drinks","entertainment","games","travel"],roommates:["stay-in","food-drinks","budget-friendly","games","weekend"],school:["learning","budget-friendly","food-drinks","weekend","entertainment"],creative:["something-new","learning","outdoors","entertainment","stay-in"],
};
const CATEGORY_SIGNALS:readonly [RegExp,InspirationIntentId][]=[[/restaurant|food|recipe|drink|coffee|grocer/i,"food-drinks"],[/date|couple/i,"date-night"],[/hike|camp|outdoor|scenic|water/i,"outdoors"],[/trip|travel|destination|hotel|vacation/i,"travel"],[/home|staycation|apartment/i,"stay-in"],[/budget|free/i,"budget-friendly"],[/weekend|outing/i,"weekend"],[/game|co-op|competitive/i,"games"],[/movie|show|concert|event/i,"entertainment"],[/study|book|goal|school|learn/i,"learning"]];
const TEMPLATE_SIGNAL:Partial<Record<IdeaTemplateId,InspirationIntentId>>={restaurant:"food-drinks",coffee:"food-drinks",movie:"entertainment",event:"entertainment","day-trip":"weekend",trip:"travel",hotel:"travel",hike:"outdoors",camping:"outdoors",game:"games",book:"learning"};

export function orderInspirationIntents({spaceTemplateId,categories,recentIntentIds=[],recentIdeaTemplateIds=[]}:{spaceTemplateId?:SpaceTemplateId;categories:readonly CategoryDef[];recentIntentIds?:readonly InspirationIntentId[];recentIdeaTemplateIds?:readonly IdeaTemplateId[]}):InspirationIntent[]{
  const score=new Map<InspirationIntentId,number>();const boost=(id:InspirationIntentId,value:number)=>score.set(id,(score.get(id)||0)+value);
  SPACE_ORDERS[spaceTemplateId||"blank"]?.forEach((id,index)=>boost(id,60-index*6));
  categories.forEach(category=>CATEGORY_SIGNALS.forEach(([pattern,id])=>{if(pattern.test(category.label))boost(id,10)}));
  recentIdeaTemplateIds.slice(0,5).forEach((templateId,index)=>{const intent=TEMPLATE_SIGNAL[templateId];if(intent)boost(intent,12-index)});
  recentIntentIds.slice(0,3).forEach((id,index)=>boost(id,8-index));
  return [...INSPIRATION_INTENTS].sort((a,b)=>(score.get(b.id)||0)-(score.get(a.id)||0)||INSPIRATION_INTENTS.indexOf(a)-INSPIRATION_INTENTS.indexOf(b));
}
export function chooseSurpriseSuggestion(items:readonly InspirationSuggestion[],spaceTemplateId:SpaceTemplateId|undefined,lastId?:string|null,random:()=>number=Math.random):InspirationSuggestion{
  const suited=items.filter(item=>item.spaceTemplateIds.includes(spaceTemplateId||"blank"));const pool=(suited.length?suited:items).filter(item=>item.id!==lastId);const candidates=pool.length?pool:(suited.length?suited:items);return candidates[Math.min(candidates.length-1,Math.floor(random()*candidates.length))];
}
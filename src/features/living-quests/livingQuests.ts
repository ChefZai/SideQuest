import type { ActivityItem, Idea, Reaction, ReactionDef, Space } from "../../v2/domain";
import { isPositiveReaction } from "../product-focus/productFocus";
import { resolveQuestStatus, resolveQuestType } from "../quests/questTypes";
import { normalizeMoment, type MomentRecord } from "../journeys/journeyTypes";

export const SIDEQUEST_VERSION = "5.0";
export interface GoalProgress { current:number; target:number; unit:string; percentage:number; nextThreshold:number|null }
export interface MomentumSignal { kind:"shared"|"milestone"|"moment"|"recent"|"ready"|"quiet"; label:string; weight:number }
const stamp=(value:{updatedAt?:{toMillis?:()=>number};createdAt?:{toMillis?:()=>number}})=>value.updatedAt?.toMillis?.()??value.createdAt?.toMillis?.()??0;

export function measurableGoal(quest:Idea):GoalProgress|null{
  if(resolveQuestType(quest.questType)!=="goal")return null;
  const target=Number(quest.goalTarget),current=Number(quest.goalCurrent??0);
  if(!Number.isFinite(target)||target<=0||!Number.isFinite(current)||current<0)return null;
  const thresholds=[25,50,75,100].map(value=>target*value/100);
  return{current,target,unit:quest.goalUnit?.trim()||"",percentage:Math.max(0,Math.round(current/target*100)),nextThreshold:thresholds.find(value=>value>current)??null};
}
export function relationshipSummary(reactions:Reaction[],definitions:ReactionDef[],space:Space,profileId:string):string{
  if(space.memberIds.length<=1)return"A Quest of your own";
  const positive=new Set(definitions.filter(isPositiveReaction).map(item=>item.type));
  const people=[...new Set(reactions.filter(item=>positive.has(item.type)).map(item=>item.userId))];
  if(people.length>=2)return"You both want this";
  if(people.includes(profileId)){const id=space.memberIds.find(value=>value!==profileId);return`Waiting for ${id?space.memberNames[id]||"their":"their"} reaction`}
  if(people.length===1)return`${space.memberNames[people[0]]||"Someone"} is excited about this`;
  return"Shared without pressure";
}
export function momentumSignals(quest:Idea,events:ActivityItem[]=[],space?:Space):MomentumSignal[]{
  const related=events.filter(event=>(event.questId||event.targetId)===quest.id),milestones=related.filter(event=>event.isMilestone||event.momentType==="milestone-reached"),signals:MomentumSignal[]=[];
  if(milestones.length)signals.push({kind:"milestone",label:`${milestones.length} ${milestones.length===1?"Milestone":"Milestones"} reached`,weight:8});
  if(related.length)signals.push({kind:"moment",label:`${related.length} ${related.length===1?"Moment":"Moments"} in the story`,weight:5});
  const latest=related.map(event=>normalizeMoment({...event,id:event.id})).sort((a,b)=>(b.createdAt?.toMillis?.()??0)-(a.createdAt?.toMillis?.()??0))[0];
  if(latest?.createdAt?.toMillis){const days=Math.max(0,Math.floor((Date.now()-latest.createdAt.toMillis())/86400000));signals.push({kind:"recent",label:days===0?"Last touched today":days===1?"Last touched yesterday":`Last touched ${days} days ago`,weight:4})}
  if(["planning","in-progress"].includes(resolveQuestStatus(quest.status,quest.completed)))signals.push({kind:"ready",label:"This is starting to feel real",weight:7});
  if(space&&space.memberIds.length>1)signals.push({kind:"shared",label:`Shared with ${space.memberIds.length} people`,weight:3});
  if(!signals.length)signals.push({kind:"quiet",label:"A possibility worth returning to",weight:1});
  return signals.sort((a,b)=>b.weight-a.weight).slice(0,2);
}
export function heroQuestScore(quest:Idea,events:ActivityItem[]=[],featuredId?:string|null):number{
  if(quest.completed||resolveQuestStatus(quest.status,quest.completed)==="completed")return-Infinity;
  let score=featuredId===quest.id?1000:0;const status=resolveQuestStatus(quest.status,quest.completed);
  score+=status==="in-progress"?80:status==="planning"?60:status==="paused"?-20:0;if(quest.photoUrl)score+=20;if(measurableGoal(quest))score+=24;
  const related=events.filter(event=>(event.questId||event.targetId)===quest.id);score+=Math.min(40,related.filter(event=>event.isMilestone||event.momentType==="milestone-reached").length*12);score+=Math.min(25,related.filter(event=>["reaction-added","journey-resumed","photo-added","memory-added"].includes(event.momentType||event.action)).length*5);
  const age=stamp(quest)?(Date.now()-stamp(quest))/86400000:365;return score+Math.max(-25,30-Math.floor(age/7)*5);
}
export function selectHeroQuest(quests:Idea[],events:ActivityItem[]=[],featuredId?:string|null):Idea|null{return quests.map(quest=>({quest,score:heroQuestScore(quest,events,featuredId)})).filter(item=>Number.isFinite(item.score)).sort((a,b)=>b.score-a.score||stamp(b.quest)-stamp(a.quest)||a.quest.id.localeCompare(b.quest.id))[0]?.quest??null}
export function meaningfulMoments(events:ActivityItem[]):MomentRecord[]{const allowed=new Set(["quest-created","reaction-added","milestone-reached","quest-completed","reflection-written","memory-added","photo-added","invitation-accepted","journey-started","journey-resumed","journey-reopened"]);return events.map(event=>normalizeMoment({...event,id:event.id})).filter(moment=>allowed.has(moment.type))}
export function livingHomeGroups(quests:Idea[],events:ActivityItem[],profileId:string){const active=quests.filter(quest=>!quest.completed),forQuest=(quest:Idea)=>events.filter(event=>(event.questId||event.targetId)===quest.id);return{waitingOnYou:active.filter(quest=>quest.createdBy!==profileId&&!forQuest(quest).some(event=>event.actorId===profileId&&event.momentType==="reaction-added")),gettingExciting:active.filter(quest=>new Set(forQuest(quest).filter(event=>event.momentType==="reaction-added").map(event=>event.actorId)).size>=2),almostReal:active.filter(quest=>["planning","in-progress"].includes(resolveQuestStatus(quest.status,quest.completed))||forQuest(quest).some(event=>event.isMilestone)),recentlyRemembered:quests.filter(quest=>quest.completed).sort((a,b)=>stamp(b)-stamp(a))}}
export function featuredMemory(quests:Idea[]):Idea|null{return quests.filter(quest=>quest.completed).sort((a,b)=>Number(Boolean(b.photoUrl))-Number(Boolean(a.photoUrl))||stamp(b)-stamp(a)||a.id.localeCompare(b.id))[0]??null}
export function contextualNextAction(quest:Idea,events:ActivityItem[]=[]):{label:string;kind:"moment"|"milestone"|"progress"|"plan"|"reflection"}{if(quest.completed)return{label:"Write a reflection",kind:"reflection"};if(measurableGoal(quest))return{label:"Update progress",kind:"progress"};if(["planning","in-progress"].includes(resolveQuestStatus(quest.status,quest.completed)))return{label:"Add a Moment",kind:"moment"};if(!events.some(event=>(event.questId||event.targetId)===quest.id&&event.isMilestone))return{label:"Add a Milestone",kind:"milestone"};return{label:"Make it real",kind:"plan"}}
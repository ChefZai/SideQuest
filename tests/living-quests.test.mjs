import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { readFile } from "node:fs/promises";
import { createServer } from "vite";

let server, living;
const stamp = value => ({ toMillis: () => value });
const quest = patch => ({ id:"q",spaceId:"s",title:"Quest",category:"Possibility",categoryEmoji:"✨",accent:"0,0,0",description:"",location:"",tags:[],price:"",duration:"",photoUrl:"",createdBy:"u",createdByName:"Isaiah",completed:false,questType:"experience",status:"inspired",createdAt:stamp(100),updatedAt:stamp(100),...patch });
const space = { id:"s",name:"Us",emoji:"✨",type:"custom",ownerId:"u",adminIds:[],memberIds:["u","z"],memberNames:{u:"Isaiah",z:"Zoe"},categories:[],reactionDefs:[{type:"love",emoji:"❤️",label:"Love this"}] };
const event = patch => ({ id:"e",spaceId:"s",actorId:"u",actorName:"Isaiah",action:"quest-created",targetId:"q",targetTitle:"Quest",questId:"q",momentType:"quest-created",createdAt:stamp(200),...patch });

before(async()=>{server=await createServer({server:{middlewareMode:true},appType:"custom",logLevel:"silent"});living=await server.ssrLoadModule("/src/features/living-quests/livingQuests.ts")});
after(async()=>server?.close());

test("only naturally measurable Goal Quests receive progress",()=>{assert.equal(living.measurableGoal(quest({questType:"experience",goalTarget:10,goalCurrent:2})),null);assert.deepEqual(living.measurableGoal(quest({questType:"goal",goalTarget:50,goalCurrent:17,goalUnit:"books"})),{current:17,target:50,unit:"books",percentage:34,nextThreshold:25})});
test("invalid Goal values fall back to Momentum",()=>{for(const patch of[{goalTarget:0},{goalTarget:-1},{goalTarget:10,goalCurrent:-1},{goalTarget:Number.NaN}])assert.equal(living.measurableGoal(quest({questType:"goal",...patch})),null)});
test("Goal progress safely allows intentional overachievement",()=>{const result=living.measurableGoal(quest({questType:"goal",goalTarget:10,goalCurrent:12}));assert.equal(result.percentage,120);assert.equal(result.nextThreshold,null)});
test("Hero scoring excludes completed Quests",()=>{assert.equal(living.heroQuestScore(quest({completed:true,status:"completed"}),[]),-Infinity)});
test("Hero scoring favors active, visual, meaningful Quests",()=>{const quiet=quest({id:"quiet"}),active=quest({id:"active",status:"in-progress",photoUrl:"photo.jpg"});assert.ok(living.heroQuestScore(active,[event({targetId:"active",questId:"active",isMilestone:true,momentType:"milestone-reached"})])>living.heroQuestScore(quiet,[]))});
test("Hero selection uses stable ID tie-breaking",()=>{const selected=living.selectHeroQuest([quest({id:"b"}),quest({id:"a"})],[]);assert.equal(selected.id,"a")});
test("manual Hero feature override wins without storing a score",()=>{assert.equal(living.selectHeroQuest([quest({id:"a"}),quest({id:"b"})],[],"b").id,"b")});
test("Momentum uses actual Moments and active state",()=>{const signals=living.momentumSignals(quest({status:"planning"}),[event({isMilestone:true,momentType:"milestone-reached"})],space);assert.ok(signals.some(item=>item.kind==="milestone"));assert.ok(signals.some(item=>item.kind==="ready"))});
test("relationship summary recognizes mutual positive intent",()=>{assert.equal(living.relationshipSummary([{userId:"u",userName:"Isaiah",type:"love"},{userId:"z",userName:"Zoe",type:"love"}],space.reactionDefs,space,"u"),"You both want this")});
test("relationship summary does not invent mutual interest",()=>{assert.match(living.relationshipSummary([{userId:"u",userName:"Isaiah",type:"love"}],space.reactionDefs,space,"u"),/Waiting for Zoe/)});
test("Home groups derive from real sharing, reactions, and planning",()=>{const shared=quest({id:"shared",createdBy:"z"}),real=quest({id:"real",status:"planning"}),excited=quest({id:"excited"});const events=[event({id:"1",questId:"excited",targetId:"excited",actorId:"u",momentType:"reaction-added"}),event({id:"2",questId:"excited",targetId:"excited",actorId:"z",momentType:"reaction-added"})];const groups=living.livingHomeGroups([shared,real,excited],events,"u");assert.deepEqual(groups.waitingOnYou.map(x=>x.id),["shared"]);assert.deepEqual(groups.gettingExciting.map(x=>x.id),["excited"]);assert.deepEqual(groups.almostReal.map(x=>x.id),["real"])});
test("featured Memory selection is deterministic and image-aware",()=>{assert.equal(living.featuredMemory([quest({id:"plain",completed:true}),quest({id:"photo",completed:true,photoUrl:"x"})]).id,"photo")});
test("Journey filtering removes low-value technical edits",()=>{const moments=living.meaningfulMoments([event({id:"status",momentType:"status-changed"}),event({id:"photo",momentType:"photo-added"})]);assert.deepEqual(moments.map(x=>x.id),["photo"])});
test("contextual next action respects Goal, planning, and completion",()=>{assert.equal(living.contextualNextAction(quest({questType:"goal",goalTarget:10,goalCurrent:2})).kind,"progress");assert.equal(living.contextualNextAction(quest({status:"planning"})).kind,"moment");assert.equal(living.contextualNextAction(quest({completed:true})).kind,"reflection")});
test("Milestone persistence updates one deterministic Moment",async()=>{const source=await readFile("src/v2/data.ts","utf8");assert.match(source,/setDoc\(doc\(db,"activity",id\)/);assert.match(source,/completeMilestone/);assert.match(source,/transaction\.update\(reference/);assert.doesNotMatch(source,/completeMilestone[^]+addDoc\(collection\(db,"activity"\)/)});

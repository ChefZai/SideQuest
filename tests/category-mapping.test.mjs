import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let server, mapping, packs;
before(async()=>{server=await createServer({server:{middlewareMode:true},appType:"custom"});mapping=await server.ssrLoadModule("/src/features/templates/categoryMapping.ts");packs=await server.ssrLoadModule("/src/features/templates/categoryPacks.ts")});
after(async()=>server?.close());

const expected={couple:["restaurant","Restaurants"],friends:["game","Game Night"],travel:["hotel","Hotels"],family:["gift","Birthdays"],roommates:["gift","Purchases"],adventure:["hike","Hiking"],school:["event","Campus Events"],gaming:["game","Games to Try"],creative:["photo-spot","Photography"]};
for(const [spaceTemplate,[ideaTemplate,label]] of Object.entries(expected))test(`${spaceTemplate} maps ${ideaTemplate} to its closest starter category`,()=>{const categories=packs.getCategoryPack(spaceTemplate);assert.equal(mapping.resolveIdeaCategory(ideaTemplate,categories)?.label,label)});
test("Blank Space safely has no automatic match",()=>assert.equal(mapping.resolveIdeaCategory("restaurant",[]),undefined));
test("custom category labels match even when stable IDs differ",()=>{const custom={id:"user-123",label:"Food & Drinks"};assert.equal(mapping.resolveIdeaCategory("restaurant",[custom]),custom)});
test("Activity is only used after better priorities fail",()=>{const activity={id:"activity",label:"Activity"},restaurant={id:"restaurants",label:"Restaurants"};assert.equal(mapping.resolveIdeaCategory("restaurant",[activity,restaurant]),restaurant);assert.equal(mapping.resolveIdeaCategory("restaurant",[activity]),activity)});
test("every built-in template has a centralized ordered mapping",()=>{for(const id of ["restaurant","coffee","movie","event","day-trip","trip","hotel","hike","camping","gift","game","book","photo-spot","activity","custom"]){const priorities=mapping.IDEA_TEMPLATE_CATEGORY_PRIORITIES[id];assert.ok(priorities.length>=2,id);assert.equal(priorities.at(-1),"Activity")}});

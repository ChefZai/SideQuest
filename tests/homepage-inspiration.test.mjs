import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { readFile } from "node:fs/promises";

let server, shelf, filters, catalog;
before(async()=>{server=await createServer({server:{middlewareMode:true},appType:"custom"});shelf=await server.ssrLoadModule("/src/v2/InspirationShelf.tsx");filters=await server.ssrLoadModule("/src/v2/inspirationFilters.ts");catalog=await server.ssrLoadModule("/src/features/templates/inspirationCatalog.ts")});
after(async()=>server?.close());
const space={id:"s",name:"Together",emoji:"✨",type:"couple",ownerId:"u",adminIds:[],memberIds:["u"],memberNames:{u:"You"},categories:[],reactionDefs:[],templateId:"couple"};

test("Home Inspiration is compact and exposes one Explore action",()=>{const markup=renderToStaticMarkup(React.createElement(shelf.InspirationShelf,{space,profileId:"u",onSelect(){}}));assert.match(markup,/Need inspiration\?/);assert.match(markup,/Explore all ideas/);assert.equal((markup.match(/class="inspiration-card"/g)||[]).length,5);assert.doesNotMatch(markup,/All inspiration/)});
test("every compact filter returns an intentional collection",()=>{for(const filter of filters.INSPIRATION_FILTERS){const items=filters.inspirationItems(catalog.INSPIRATION_CATALOG,filter.id,"couple");assert.ok(items.length,filter.id)}});
test("Space-aware For You changes with the selected Space template",()=>{const couple=filters.inspirationItems(catalog.INSPIRATION_CATALOG,"for-you","couple").map(x=>x.id);const gaming=filters.inspirationItems(catalog.INSPIRATION_CATALOG,"for-you","gaming").map(x=>x.id);assert.notDeepEqual(couple,gaming)});
test("preview cards have meaningful accessible labels and no eager images",()=>{const markup=renderToStaticMarkup(React.createElement(shelf.InspirationShelf,{space,profileId:"u",onSelect(){}}));assert.match(markup,/aria-label="Start .+ as a .+ Idea"/);assert.doesNotMatch(markup,/<img/);assert.match(markup,/aria-label="Previous inspiration"/);assert.match(markup,/aria-label="Next inspiration"/)});
test("chip control announces selection and supports keyboard categories",()=>{const markup=renderToStaticMarkup(React.createElement(shelf.InspirationShelf,{space,profileId:"u",onSelect(){}}));assert.match(markup,/role="tablist"/);assert.match(markup,/aria-selected="true"/);assert.match(markup,/For You/)});
test("suggestions only enter the real editor as editable draft seed data",async()=>{const source=await readFile("src/v2/AppV2.tsx","utf8");assert.match(source,/setIdeaSeed\(suggestion\);setIdeaTemplateId\(suggestion\.templateId\);setModal\("idea"\)/);assert.match(source,/seed\?\.prefill\?\.title/);assert.match(source,/resolveIdeaCategory\(initialTemplateId,space\.categories\)/)});
test("the full view remains lazy and preserves date-aware Seasonal Inspiration",async()=>{const shelfSource=await readFile("src/v2/InspirationShelf.tsx","utf8"),fullSource=await readFile("src/v2/FullInspirationView.tsx","utf8");assert.match(shelfSource,/lazy\(\(\)=>import\("\.\/FullInspirationView"\)/);assert.match(fullSource,/selected==="seasonal"&&<SeasonalInspiration/)});
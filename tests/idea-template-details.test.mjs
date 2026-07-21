import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server; let details;
const idea = patch => ({id:"i",spaceId:"s",title:"Idea",category:"Plans",categoryEmoji:"✨",accent:"1,2,3",description:"",location:"",mapsUrl:"",tags:[],price:"",duration:"",photoUrl:"",createdBy:"u",createdByName:"Isaiah",completed:false,...patch});
before(async()=>{server=await createServer({server:{middlewareMode:true},appType:"custom",logLevel:"silent"});details=await server.ssrLoadModule("/src/v2/IdeaTemplateDetails.tsx")});
after(async()=>server?.close());

test("existing and unknown Ideas retain the generic detail fallback",()=>{
  assert.equal(renderToStaticMarkup(React.createElement(details.IdeaTemplateDetails,{idea:idea({})})),"");
  assert.equal(renderToStaticMarkup(React.createElement(details.IdeaTemplateDetails,{idea:idea({templateId:"unknown",templateData:{recipient:"Private"}})})),"");
});
test("Restaurant, Movie, Trip, Hike, Event, and Gift render meaningful structured details",()=>{
  const cases=[["restaurant",{cuisine:"Ethiopian",reservationLink:"https://example.com"},/Ethiopian/],["movie",{runtimeMinutes:120,streamingService:"Library"},/2 hrs/],["trip",{destination:"Lisbon",budgetGoal:2400},/\$2,400/],["hike",{difficulty:"Moderate",distanceMiles:5.5},/5.5 mi/],["event",{venue:"The Park",eventDate:"2026-08-01"},/The Park/],["gift",{recipient:"Zoe",deadline:"2026-12-01"},/Zoe/]];
  for(const[templateId,templateData,expected]of cases){const markup=renderToStaticMarkup(React.createElement(details.IdeaTemplateDetails,{idea:idea({templateId,templateVersion:1,templateData})}));assert.match(markup,expected)}
});
test("unsafe links are never rendered as anchors",()=>{
  const markup=renderToStaticMarkup(React.createElement(details.IdeaTemplateDetails,{idea:idea({templateId:"event",templateVersion:1,templateData:{venue:"Hall",ticketLink:"javascript:alert(1)"}})}));
  assert.doesNotMatch(markup,/javascript:/); assert.doesNotMatch(markup,/Open tickets/);
});
test("malformed empty template data does not create a hollow section",()=>assert.equal(renderToStaticMarkup(React.createElement(details.IdeaTemplateDetails,{idea:idea({templateId:"hike",templateVersion:1,templateData:"broken"})})),""));

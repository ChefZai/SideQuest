import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const [space,starter,app,reliability,help,onboarding,css,main]=await Promise.all([
  readFile("src/v2/SpaceTemplateCreator.tsx","utf8"),
  readFile("src/v2/StarterIdeaEditor.tsx","utf8"),
  readFile("src/v2/AppV2.tsx","utf8"),
  readFile("src/v2/reliability.ts","utf8"),
  readFile("src/v2/help-content.ts","utf8"),
  readFile("src/v2/onboarding.tsx","utf8"),
  readFile("src/v2/ux-simplification.css","utf8"),
  readFile("src/main.tsx","utf8"),
]);

test("Space creation defaults to a featured picker and name-only fast path",()=>{
  assert.match(space,/featuredTemplateIds[\s\S]*"couple"[\s\S]*"friends"[\s\S]*"travel"[\s\S]*"blank"/);
  assert.match(space,/See all templates/);
  assert.match(space,/template-fast-name/);
  assert.match(space,/comes ready with:/);
});

test("optional customization preserves all existing groups",()=>{
  for(const label of["Identity","Appearance","Categories","Starter Quests"])assert.ok(space.includes(label),label);
  assert.match(space,/template-customize-button/);
  assert.match(space,/customizing &&/);
});

test("starter Quests stay compact and individually editable",()=>{
  assert.match(starter,/editingId === idea.id/);
  assert.match(starter,/Disable all/);
  assert.match(starter,/Add Quest/);
  assert.match(starter,/normal editable Quests/);
});

test("Quick Capture remains minimal while advanced fields stay disclosed",()=>{
  assert.match(app,/Start with a title, link, or photo\. Everything else can wait\./);
  assert.match(app,/<summary>More options<\/summary>/);
  assert.match(app,/disabled=\{busy\|\|!title\.trim\(\)\}/);
  assert.match(app,/submitting\.current/);
});

test("permission and connectivity failures use human recovery language",()=>{
  assert.doesNotMatch(reliability,/You do not have permission for that action/);
  for(const phrase of["Your access may have changed","your draft is still here","invitation is no longer available"])assert.ok(reliability.includes(phrase),phrase);
});

test("first-use loading and feedback use branded shared foundations",()=>{
  assert.match(app,/busy-layout/);
  for(const selector of[".toast-success",".toast-warning",".toast-error",".busy-layout",".busy-memory"])assert.ok(css.includes(selector),selector);
  assert.ok(main.indexOf("ux-simplification.css")<main.indexOf("design-system.css"));
});

test("Help and onboarding explain the simplified flow accurately",()=>{
  for(const id of["quick-capture","more-options","space-customization"])assert.ok(help.includes(`id:"${id}"`),id);
  assert.match(onboarding,/A title, link, or photo is enough/);
  assert.match(onboarding,/Start exploring/);
});

test("dark Memory focus and reduced motion remain explicit",()=>{
  assert.match(css,/\.detail:has\(\.memory\)[\s\S]*:focus-visible/);
  assert.match(css,/prefers-reduced-motion:reduce/);
});

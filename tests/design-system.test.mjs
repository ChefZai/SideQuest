import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const css=await readFile("src/v2/design-system.css","utf8");
const mobile=await readFile("src/v2/mobile-architecture.css","utf8");
const main=await readFile("src/main.tsx","utf8");
const docs=await readFile("docs/DESIGN_SYSTEM.md","utf8");

test("the unified design system loads last",()=>{
  assert.ok(main.indexOf("design-system.css")>main.indexOf("interaction-system.css"));
});

test("foundation, semantic, and component token families exist",()=>{
  for(const token of["--space-1","--font-editorial","--radius-card","--shadow-card","--color-canvas","--color-text-primary","--color-action","--space-page-inline","--control-height","--hero-radius"]){
    assert.match(css,new RegExp(token));
  }
});

test("Sprint 1 safe-area and scrolling foundations remain authoritative",()=>{
  for(const token of["--safe-top","--safe-bottom","--navigation-height","--bottom-clearance","--dialog-max-height"])assert.match(mobile,new RegExp(token));
  assert.match(mobile,/\.backdrop > \.modal[\s\S]*overflow-y: auto/);
  assert.match(css,/--space-page-inline: var\(--page-padding-inline\)/);
});

test("shared component states cover buttons, cards, forms, and feedback",()=>{
  for(const selector of[".primary:hover", ".secondary:hover", ":disabled", ".living-card", "aria-invalid", ".notice", ".error", ".busy::before"]){
    assert.ok(css.includes(selector),selector);
  }
});

test("focus, reduced motion, and phone typography stay accessible",()=>{
  assert.match(css,/:focus-visible/);
  assert.match(css,/@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css,/@media \(max-width: 767px\)[\s\S]*font-size: 16px/);
  assert.match(css,/--control-height: 44px/);
});

test("image behavior and design-system guidance are documented",()=>{
  assert.match(css,/img\[loading="lazy"\]/);
  for(const heading of["## Tokens","## Typography","## Buttons","## Cards","## Dialogs and Sheets","## Accessibility","## Intentional Exceptions"])assert.ok(docs.includes(heading),heading);
});

import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const css=await readFile("src/v2/mobile-architecture.css","utf8");
const app=await readFile("src/main.tsx","utf8");
const inspiration=await readFile("src/v2/FullInspirationView.tsx","utf8");

test("mobile architecture is loaded after the legacy fixed shell",()=>{
  assert.match(app,/mobile-shell\.css";\s*import "\.\/v2\/mobile-architecture\.css"/);
});

test("safe-area and layout tokens are centralized",()=>{
  for(const token of ["--safe-top","--safe-bottom","--navigation-height","--page-padding-inline","--page-max-width","--bottom-clearance","--dialog-padding"]){
    assert.match(css,new RegExp(token));
  }
});

test("detail dialogs are independent reachable scroll roots",()=>{
  assert.match(css,/\.backdrop > \.modal[\s\S]*overflow-y: auto/);
  assert.match(css,/\.backdrop > \.detail[\s\S]*overflow-y: auto !important/);
  assert.match(css,/--dialog-max-height: calc\(100dvh/);
});

test("phone fields prevent Safari zoom and controls meet touch sizing",()=>{
  assert.match(css,/@media \(max-width: 767px\)[\s\S]*input, textarea, select \{ font-size: 16px !important/);
  assert.match(css,/button, summary, select,[\s\S]*min-height: 44px/);
  assert.match(css,/\.quest-status-chip select \{ min-height: 44px/);
  assert.match(css,/\.help-section-links a \{ min-height: 44px/);
});

test("Inspiration progressively discloses the catalog",()=>{
  assert.match(inspiration,/useState\(8\)/);
  assert.match(inspiration,/rest\.slice\(0,visibleCount\)/);
  assert.match(inspiration,/Load more possibilities/);
});

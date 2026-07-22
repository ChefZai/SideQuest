import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

test("desktop uses one document scroll root with normal wheel chaining",async()=>{const css=await readFile("src/v2/responsive-shell.css","utf8");assert.match(css,/@media \(min-width: 768px\)[\s\S]*html \{[^}]*overflow-y: auto;[^}]*overscroll-behavior: auto;/);assert.match(css,/body, #root \{[^}]*overflow: visible;[^}]*overscroll-behavior: auto;/);assert.doesNotMatch(css,/html, body, #root \{[^}]*overflow-y: auto/)});
test("homepage controls do not cancel ordinary vertical wheel scrolling",async()=>{const source=await readFile("src/v2/InspirationShelf.tsx","utf8");assert.doesNotMatch(source,/onWheel=/);assert.doesNotMatch(source,/wheelChips/);assert.match(source,/scrollBy\(\{left:-280/)});
test("mobile fixed-shell scrolling remains intact",async()=>{const css=await readFile("src/v2/mobile-shell.css","utf8");assert.match(css,/body \{[\s\S]*position: fixed;/);assert.match(css,/\.content \{[\s\S]*overflow-y: auto;/)});

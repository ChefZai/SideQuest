import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { build } from "esbuild";
import React from "react";

let module;
test.before(async () => {
  const result = await build({
    entryPoints: ["src/features/stories/storyReadiness.ts"],
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    external: ["react"],
  });
  module = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
});

test("completed Quests expose future Story source material without generating a Story", () => {
  const readiness = module.memoryStoryReadiness(
    { id: "quest-1", photoUrl: "cover.jpg", location: "Yosemite" },
    { photoUrls: ["memory.jpg"] },
    [{ id: "reflection-1" }],
    { memberIds: ["a", "b"] },
  );
  assert.equal(readiness.coverPhoto, "memory.jpg");
  assert.equal(readiness.peopleLabel, "Shared by 2 people");
  assert.equal(readiness.locationLabel, "Remembered in Yosemite");
  assert.deepEqual(readiness.source, {
    questId: "quest-1",
    journeyAvailable: true,
    momentCompatible: true,
    milestoneCompatible: true,
  });
});

test("relationship metadata remains optional, normalized, and backward compatible", async () => {
  const source = await readFile("src/features/quests/questTypes.ts", "utf8");
  assert.match(source, /parentQuestId\?: string \| null/);
  assert.match(source, /relatedQuestIds\?: string\[\]/);
  assert.match(source, /new Set/);
});

test("Memory mode uses nostalgic story-first hierarchy", async () => {
  const source = await readFile("src/v2/AppV2.tsx", "utf8");
  assert.match(source, /A Journey worth revisiting/);
  assert.match(source, /memoryStoryReadiness/);
  assert.match(source, /memory-story-facts/);
  assert.doesNotMatch(source, />Edit Quest</);
});

test("Collections remain supported without competing for Home attention", async () => {
  const home = await readFile("src/v2/HomeQuestSections.tsx", "utf8");
  const app = await readFile("src/v2/AppV2.tsx", "utf8");
  assert.doesNotMatch(home, /Collections Growing/);
  assert.match(app, /questType===\"collection\"/);
  assert.match(app, /Part of a Collection/);
});

test("destructive and empty-state language remains warm but unambiguous", async () => {
  const source = await readFile("src/v2/AppV2.tsx", "utf8");
  assert.match(source, /Let this Quest go/);
  assert.match(source, /Your map is ready for its first place/);
  assert.match(source, /conversation can begin whenever/);
  assert.match(source, /This removes the Quest/);
});

test("new interactive surfaces preserve touch and reduced-motion requirements", async () => {
  const css = await readFile("src/v2/experience-identity.css", "utf8");
  assert.match(css, /min-height:44px/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media\(max-width:700px\)/);
});


import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFile } from "node:fs/promises";
import { createServer } from "vite";

let server;
let quests;
let home;
let picker;
let save;

const space = {
  id: "space",
  name: "Our Future",
  emoji: "🧭",
  ownerId: "owner",
  memberIds: ["owner"],
  memberNames: { owner: "Isaiah" },
  categories: [],
  reactionDefs: [],
};
const profile = { id: "owner", displayName: "Isaiah", onboarding: { completed: true } };
const idea = patch => ({
  id: "quest",
  spaceId: "space",
  title: "See the northern lights",
  category: "Future Dreams",
  categoryEmoji: "✨",
  accent: "1,2,3",
  description: "",
  location: "",
  tags: [],
  price: "",
  duration: "",
  photoUrl: "",
  createdBy: "owner",
  createdByName: "Isaiah",
  completed: false,
  ...patch,
});

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  quests = await server.ssrLoadModule("/src/features/quests/questTypes.ts");
  home = await server.ssrLoadModule("/src/v2/HomeQuestSections.tsx");
  picker = await server.ssrLoadModule("/src/v2/QuestTypePicker.tsx");
  save = await server.ssrLoadModule("/src/v2/idea-save.ts");
});
after(async () => server?.close());

test("legacy records default to Experience and Planning without migration", () => {
  const normalized = quests.normalizeQuestMetadata(idea({}));
  assert.equal(normalized.questType, "experience");
  assert.equal(normalized.status, "planning");
  assert.equal(normalized.collectionId, null);
});

test("completed legacy records default to Completed Journey", () => {
  const normalized = quests.normalizeQuestMetadata(idea({ completed: true }));
  assert.equal(normalized.status, "completed");
});

test("valid Quest type, status, and Collection assignment survive normalization", () => {
  const normalized = quests.normalizeQuestMetadata(idea({
    questType: "goal",
    status: "in-progress",
    collectionId: "  collection-one  ",
  }));
  assert.equal(normalized.questType, "goal");
  assert.equal(normalized.status, "in-progress");
  assert.equal(normalized.collectionId, "collection-one");
});

test("unknown Quest metadata falls back safely", () => {
  const normalized = quests.normalizeQuestMetadata(idea({
    questType: "unknown",
    status: "blocked",
    collectionId: 42,
  }));
  assert.equal(normalized.questType, "experience");
  assert.equal(normalized.status, "planning");
  assert.equal(normalized.collectionId, null);
});

test("Quest create sanitizer preserves additive metadata", () => {
  const clean = save.sanitizeIdeaCreateInput(idea({
    questType: "relationship",
    status: "inspired",
    collectionId: "collection-one",
  }));
  assert.equal(clean.questType, "relationship");
  assert.equal(clean.status, "inspired");
  assert.equal(clean.collectionId, "collection-one");
});

test("Quest type chooser exposes all six accessible choices", () => {
  const markup = renderToStaticMarkup(React.createElement(picker.QuestTypePicker, {
    onSelect() {},
    onClose() {},
  }));
  for (const label of ["Experience", "Journey", "Goal", "Relationship", "Collection", "Lifestyle"]) {
    assert.match(markup, new RegExp(`>${label}<`));
  }
  assert.match(markup, /What kind of Quest is this/);
});

test("Home renders the Quest information architecture and warm empty states", () => {
  const markup = renderToStaticMarkup(React.createElement(home.HomeQuestSections, {
    ideas: [idea({ questType: "experience", status: "planning" })],
    space,
    profile,
    onOpen() {},
    onCreate() {},
  }));
  for (const heading of ["Shared With You", "Shared Excitement", "Becoming Real"]) {
    assert.match(markup, new RegExp(heading));
  }
  assert.match(markup, /See the northern lights/);
});

test("Moment architecture remains wired while global Activity is demoted", async () => {
  const source = await readFile("src/v2/AppV2.tsx", "utf8");
  assert.doesNotMatch(source, /\[\["home",Home\],\["map",MapPin\]/);
  assert.match(source, /momentType/);
  assert.match(source, /JourneyTimeline/);
  assert.match(source, /Created this Quest/);
});

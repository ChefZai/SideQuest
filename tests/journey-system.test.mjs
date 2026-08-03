import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFile } from "node:fs/promises";
import { createServer } from "vite";

let server;
let journeys;
let momentCard;
let home;

const timestamp = value => ({ toMillis: () => value, toDate: () => new Date(value) });
const baseMoment = patch => ({
  id: "moment",
  spaceId: "space",
  questId: "quest",
  actorId: "owner",
  actorName: "Isaiah",
  type: "journey-update",
  title: "Added a Journey update",
  createdAt: timestamp(100),
  ...patch,
});
const baseIdea = patch => ({
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
  status: "planning",
  questType: "experience",
  ...patch,
});
const space = { id: "space", name: "Our Future", emoji: "🧭", ownerId: "owner", memberIds: ["owner"], memberNames: { owner: "Isaiah" }, categories: [], reactionDefs: [] };
const profile = { id: "owner", displayName: "Isaiah", onboarding: { completed: true } };

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  journeys = await server.ssrLoadModule("/src/features/journeys/journeyTypes.ts");
  momentCard = await server.ssrLoadModule("/src/v2/MomentCard.tsx");
  home = await server.ssrLoadModule("/src/v2/HomeQuestSections.tsx");
});
after(async () => server?.close());

test("legacy Activity records normalize into backward-compatible Moments", () => {
  const moment = journeys.normalizeMoment({ id: "legacy", spaceId: "space", targetId: "quest", actorId: "owner", actorName: "Isaiah", action: "completed" });
  assert.equal(moment.questId, "quest");
  assert.equal(moment.type, "quest-completed");
  assert.equal(moment.title, "Completed this Journey");
});

test("Journey ordering supports newest-first and chronological views", () => {
  const early = baseMoment({ id: "early", createdAt: timestamp(10) });
  const late = baseMoment({ id: "late", createdAt: timestamp(20) });
  assert.deepEqual(journeys.orderMoments([early, late]).map(item => item.id), ["late", "early"]);
  assert.deepEqual(journeys.orderMoments([early, late], "chronological").map(item => item.id), ["early", "late"]);
});

test("milestones are highlighted Moments rather than a separate model", () => {
  const moment = journeys.normalizeMoment({ ...baseMoment({}), type: "milestone-reached", emoji: "🎸", celebrationColor: "#f1cf67" });
  assert.equal(moment.isMilestone, true);
  const markup = renderToStaticMarkup(React.createElement(momentCard.MomentCard, { moment }));
  assert.match(markup, /moment-card milestone/);
  assert.match(markup, /🎸/);
});

test("Moment cards render optional story context accessibly", () => {
  const markup = renderToStaticMarkup(React.createElement(momentCard.MomentCard, { moment: baseMoment({ description: "A quiet turning point.", location: "Shenandoah", people: ["Isaiah", "Zoe"], reactionCount: 2 }) }));
  assert.match(markup, /A quiet turning point/);
  assert.match(markup, /Shenandoah/);
  assert.match(markup, /Isaiah, Zoe/);
});

test("Journey summaries use natural language instead of percentage-first progress", () => {
  const lines = journeys.journeySummary([baseMoment({ type: "milestone-reached", isMilestone: true })], timestamp(Date.now() - 8 * 86_400_000), false);
  assert.match(lines.join(" "), /completed 1 milestone/);
  assert.match(lines.join(" "), /began 8 days ago/);
});

test("focused Home uses real shared and active Quest signals", () => {
  const collection = baseIdea({ id: "collection", title: "National Parks", questType: "collection" });
  const child = baseIdea({ id: "child", collectionId: "collection", completed: true, status: "completed" });
  const markup = renderToStaticMarkup(React.createElement(home.HomeQuestSections, {
    ideas: [collection, child],
    events: [{ id: "event", targetId: "child", spaceId: "space", actorId: "owner", actorName: "Isaiah", action: "completed", targetTitle: child.title }],
    space,
    profile,
    onOpen() {},
    onCreate() {},
  }));
  assert.match(markup, /Continue your Quest/);
  assert.doesNotMatch(markup, /What.s Happening/, "Home hides empty dynamic groups");
  assert.match(markup, /Chapters &amp; Collections/);
  assert.match(markup, /National Parks/);
  assert.match(markup, /Remember this/);
});

test("reflection, Memory mode, manual Moments, and Journey events remain wired", async () => {
  const source = await readFile("src/v2/AppV2.tsx", "utf8");
  const timeline = await readFile("src/v2/JourneyTimeline.tsx", "utf8");
  assert.match(source, /What made this meaningful/);
  assert.match(source, /A Journey worth revisiting/);
  assert.match(source, /reflection-written/);
  assert.match(source, /quest-completed/);
  assert.match(timeline, /Add a Moment/);
  assert.match(timeline, /completeMilestone/);
  assert.match(timeline, /watchJourney/);
});

test("Journey architecture remains additive and future-friendly", async () => {
  const domain = await readFile("src/v2/domain.ts", "utf8");
  const rules = await readFile("firestore.rules", "utf8");
  assert.ok(domain.includes("momentType?:MomentType"));
  assert.ok(domain.includes("goalTarget?:number|null"));
  assert.match(rules, /match \/activity\/\{activityId\}/);
});

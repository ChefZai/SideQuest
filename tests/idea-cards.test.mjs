import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server;
let cards;

const profile = { id: "owner", displayName: "Isaiah", onboarding: { completed: true } };
const space = { id: "space", name: "Us", emoji: "✨", ownerId: "owner", memberIds: ["owner", "zoe"], memberNames: { owner: "Isaiah", zoe: "Zoe" }, categories: [], reactionDefs: [] };
const idea = (patch = {}) => ({ id: "idea", spaceId: "space", title: "A meaningful possibility with a deliberately long title that should stay controlled", category: "Plans", categoryEmoji: "✨", accent: "1,2,3", description: "", location: "Washington, District of Columbia, United States", tags: [], price: "", duration: "", photoUrl: "", createdBy: "owner", createdByName: "Isaiah", completed: false, ...patch });

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  cards = await server.ssrLoadModule("/src/v2/IdeaCard.tsx");
});
after(async () => server?.close());

test("existing untyped Ideas preserve the Custom card experience", () => {
  const markup = renderToStaticMarkup(React.createElement(cards.IdeaCard, { idea: idea(), space, profile, onOpen() {} }));
  assert.match(markup, /template-custom/);
  assert.match(markup, /Washington/);
  assert.match(markup, /Still waiting on Zoe/);
});

test("major templates expose only meaningful metadata", () => {
  const cases = [
    ["restaurant", { cuisine: "Ethiopian", priceRange: "$$" }, /Ethiopian/],
    ["movie", { genre: "Drama", runtimeMinutes: 120 }, /120 min/],
    ["trip", { destination: "Lisbon", budgetGoal: 2400 }, /Lisbon/],
    ["hike", { difficulty: "Moderate", distanceMiles: 5.5 }, /5.5 mi/],
    ["event", { eventDate: "2026-08-01", venue: "The Park" }, /The Park/],
    ["gift", { recipient: "Zoe", estimatedPrice: 80 }, /Zoe/],
    ["hotel", { nightlyEstimate: 220 }, /\$220/],
    ["game", { platform: "Switch", playerCount: 4 }, /4 players/],
  ];
  for (const [templateId, templateData, expected] of cases) {
    const markup = renderToStaticMarkup(React.createElement(cards.IdeaCard, { idea: idea({ templateId, templateVersion: 1, templateData }), space, profile, onOpen() {} }));
    assert.match(markup, expected);
    assert.doesNotMatch(markup, />undefined</);
  }
});

test("unknown and malformed templates fall back safely", () => {
  const markup = renderToStaticMarkup(React.createElement(cards.IdeaCard, { idea: idea({ templateId: "unknown", templateVersion: 99, templateData: "broken" }), space, profile, onOpen() {} }));
  assert.match(markup, /template-custom/);
});

test("cards without images render an intentional template fallback", () => {
  const markup = renderToStaticMarkup(React.createElement(cards.IdeaCard, { idea: idea({ templateId: "hike", templateVersion: 1 }), space, profile, onOpen() {} }));
  assert.match(markup, /no-image/);
  assert.match(markup, /idea-card-fallback/);
});

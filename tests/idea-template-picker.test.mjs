import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server;
let picker;
let templateTypes;

const space = templateId => ({
  id: "space-one", name: "Our Ideas", emoji: "✨", templateId,
  type: "Together", ownerId: "owner", adminIds: [], memberIds: ["owner"], memberNames: { owner: "Isaiah" },
  categories: [], reactionDefs: [],
});

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  picker = await server.ssrLoadModule("/src/v2/IdeaTemplatePicker.tsx");
  templateTypes = await server.ssrLoadModule("/src/features/templates/templateTypes.ts");
});

after(async () => server?.close());

test("picker renders Popular, Space suggestions, All templates, and Custom", () => {
  const markup = renderToStaticMarkup(React.createElement(picker.IdeaTemplatePicker, { space: space("couple"), onSelect() {}, onBack() {} }));
  assert.match(markup, /What are you thinking/);
  assert.match(markup, /Popular/);
  assert.match(markup, /Suggested for this Space/);
  assert.match(markup, /All templates/);
  assert.match(markup, /Custom/);
  assert.match(markup, /Back from Idea templates/);
});

test("suggestions respond to the current Space template", () => {
  assert.ok(picker.suggestedTemplateIds(space("couple")).includes("gift"));
  assert.ok(picker.suggestedTemplateIds(space("travel")).includes("hotel"));
  assert.ok(picker.suggestedTemplateIds(space("adventure")).includes("hike"));
  assert.ok(picker.suggestedTemplateIds(space("gaming")).includes("game"));
});

test("legacy and unknown Spaces receive safe blank-Space suggestions", () => {
  const legacy = picker.suggestedTemplateIds(space(undefined));
  const unknown = picker.suggestedTemplateIds(space("not-real"));
  assert.ok(legacy.includes("custom"));
  assert.ok(unknown.length > 0);
});

test("all supported Idea templates remain reachable", () => {
  const markup = renderToStaticMarkup(React.createElement(picker.IdeaTemplatePicker, { space: space("blank"), onSelect() {}, onBack() {} }));
  for (const id of templateTypes.IDEA_TEMPLATE_IDS) assert.match(markup, new RegExp(id === "day-trip" ? "Day Trip" : id === "photo-spot" ? "Photo Spot" : id === "trip" ? "Trip / Vacation" : id, "i"));
});
